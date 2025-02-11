"use client"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home(){

   const router = useRouter();
   
   return(
      <>
      <main className="pattern">

         <header className="flex md:flex-row flex-col min-h-screen items-center">
            <div className="w-1/2 flex justify-center flex-col items-center">

               <div className="max-w-sm">
                  <div className="text-7xl poppins font-medium text-blue-800">
                     <h1 className="text-yellow-400 drop-shadow-lg">AUTOMATE</h1>
                     <h1 className="drop-shadow-lg">with PI.LOT</h1>
                  </div>

                  <div>
                     <p className="text-sm my-6 tracking-wide">
                        Lorem ipsum lorem ipsum, lorem. Ipsum lorem ipsum, lorem, impusim, and lorem. Ipsum Lorem!
                        Lorem ipsum lorem ipsum, lorem. Lorem ipsum lorem ipsum lorem ipsum lorem ipsum lorem ipsum. Lorem ipsum lorem ipsum, lorem.
                     </p>
                  </div>
                  <div>
                     <Button variant="secondary" className="px-8 shadow" onClick={() => router.push("/dashboard")}>Start Automating</Button>
                  </div>
               </div>

            </div>

            <div className="w-1/2 flex justify-center">
               <div className="max-w-sm" >
                  <img src="home-header.svg" className="size-full" alt="Automation" />
               </div>

            </div>
         </header>

      </main>
      </>
   )
}