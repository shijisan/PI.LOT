import Link from "next/link";

const OrganizationSidebar = ({ id }) => {
  return (
    <aside className="w-full md:w-1/5 bg-white shadow-md rounded-lg p-4">
      <ul className="space-y-2">
        <li>
          <Link 
            href={`/organization/${id}`} 
            className="block w-full py-2 text-center text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Info
          </Link>
        </li>
        <li>
          <Link 
            href={`/organization/${id}/chatrooms`} 
            className="block w-full py-2 text-center text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Chatrooms
          </Link>
        </li>
        <li>
          <Link 
            href={`/organization/${id}/crm`} 
            className="block w-full py-2 text-center text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            CRM
          </Link>
        </li>
        <li>
          <Link 
            href={`/organization/${id}/tasks`} 
            className="block w-full py-2 text-center text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Task Management
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default OrganizationSidebar;
