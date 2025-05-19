'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()

  return (
    <div className="homepage flex flex-col items-center justify-center min-h-screen px-4 py-12">
      
      <div className="mb-10">
        <Image
          src="/logos.png"
          alt="Logo"
          width={320}
          height={320}
          className="mx-auto"
          style={{ marginBottom: '80px' }}
        />
      </div>

      {/* GENERAL LANDING PAGE INFO, REDIRECTS TO LISTINGS PAGE, USED INFO FORM ROOTS WEBSITE*/}
      <div className="homepage-content text-center space-y-6">
        <h1 className="text-4xl font-extrabold text-black">
          Didn’t get a low rate <i>in</i> 2021?
          <br />
          Get a low rate <b><i>from</i></b> 2021.
        </h1>
        <p className="text-xl text-black">
          Shop homes with assumable mortgages at <b>rates as low as 3%.</b>
        </p>
        <button
          className="homepage-button animate-bounce mt-6 bg-lime-300 hover:bg-lime-400 text-black font-extrabold text-lg px-8 py-4 border-2 border-black shadow-[6px_6px_0px_#000] rounded-full transition-all duration-300"
          onClick={() => router.push('/pageList')}
        >
          View Listings
        </button>
      </div>
    </div>
  )
}
