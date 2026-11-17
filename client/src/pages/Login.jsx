import React, { useState } from 'react'
import { Card, CardHeader } from "@/components/ui/card";
import { CardContent, CardDescription, CardFooter, CardTitle } from '../components/ui/card';
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function Login() {

  const [email, setEmail] = useState("")

  const submitHandler = ()=>{
    console.log(email)
  }

  return (
    <div className='min-h-[60vh]'>
      <Card className = 'md:w-[400px] sm:w-[300px] m-auto mt-5'>
        <CardHeader>
          <CardTitle>Enter Email to get Otp</CardTitle>
          <CardDescription>
            If you have already got otp on mail then you can directly go to otp tab
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='space-x-1'>
            <Label>Enter Email</Label>
            <Input type='email' value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={submitHandler}>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Login
