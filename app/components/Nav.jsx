import NotificationButton from "./NotificationButton"

export default function Nav(){
   return(
      <>
      <nav className="text-blue-800 fixed top-0 left-0 w-full z-30">

         <div className="max-w-6xl flex flex-row items-center px-4 mx-auto h-[10vh]">
            <div className="md:w-1/2">
               <h1 className="text-3xl font-medium poppins">PI.LOT</h1>
            </div>

            <ul>
               <li>
                  <a href="/">Home</a>
               </li>
               <li>
                  <NotificationButton/>
               </li>
               <li>
                  <a href="/dashboard">Dashboard</a>
               </li>
            </ul>
         </div>



      </nav>
      </>
   )
}