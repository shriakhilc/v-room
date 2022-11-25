import React, { useState } from 'react'
import { trpc } from '@/src/utils/trpc';
import { useSession } from 'next-auth/react';
const Dashboard = () => {
  const [newData, setNewData] = useState("");
  const { data: session, status: sessionStatus } = useSession();
  trpc.useQuery(
    ['user.getClassrooms', { id: session!.user!.id }],
    {
      enabled: (session != null && session.user != undefined),
      onSuccess(data) {
        setClassrooms(data);
      },

      onError(err) {
        // Only happens if user doesn't exist, which shouldn't occur due to session validation
        console.log(`pages/classroom/list: ERROR: ${err}`);
      },
    }
  )
  return (
    <div className="container mx-auto d-flex mt-5">
      <p>{newName}{}</p>
    </div>
  )
}

export default Dashboard
