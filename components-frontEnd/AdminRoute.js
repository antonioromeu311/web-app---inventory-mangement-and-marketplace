import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Auth } from 'aws-amplify';


const AdminRoute = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();
  
    useEffect(() => {
      Auth.currentAuthenticatedUser()
        .then((user) => {
          setUser(user);
  
          if (user) {
            const userGroup = user.signInUserSession.accessToken.payload['cognito:groups'][0];
            if (userGroup !== 'employee_group') {
              router.replace('/'); // redirect to home page if user is not part of employee group
            }
          } else {
            router.replace('/'); // redirect to home page if user is not authenticated
          }
        })
        .catch(() => {
          setUser(null);
          router.replace('/'); // redirect to home page if error
        });
    }, []);
  
    return <>{user ? children : null}</>; // render children only if user is authenticated
  };
  
  export default AdminRoute;
  