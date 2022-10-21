// import React from 'react'
// import { signIn, useSession, signOut } from 'next-auth/react'
// import Link from 'next/link'
// import { Button, Container, Nav, Navbar } from 'react-bootstrap'

class Header extends React.Component {
    render() {
        return (
            <>
                <header className="container mx-auto flex flex-row p-4 h-20 border-b-2">
                    <p className="text-3xl font-extrabold leading-normal">
                        V-Room 
                    </p>
                </header>
            </>
        );
    }
}

//   const handleSignIn = async () => {
//     await signIn('google', {
//       callbackUrl: 'http://localhost:3000/dashboard',
//     })
//   }

//   const handleLogout = async () => {
//     await signOut({
//       callbackUrl: 'http://localhost:3000/',
//     })
//   }

//   return (
//     <Navbar bg="light">
//       <Container>
//         <Link href="/" passHref>
//           <Navbar.Brand>NextAuth Example</Navbar.Brand>
//         </Link>
//         <Navbar.Collapse className="justify-content-end">
//           <Nav className="ml-auto">
//             {status === 'authenticated' ? (
//               <>
//                 {data.user?.image && data.user.name ? (
//                   <img
//                     src={data.user.image}
//                     alt={data.user.name}
//                     width={50}
//                     height={50}
//                     style={{ borderRadius: '50%' }}
//                   />
//                 ) : null}
//                 <Nav.Link as="div">
//                   <Link href="/dashboard" passHref>
//                     <Button variant="outline-primary">Dashboard</Button>
//                   </Link>
//                 </Nav.Link>
//                 <Nav.Link as="div">
//                   <Button onClick={handleLogout}>Logout</Button>
//                 </Nav.Link>
//               </>
//             ) : (
//               <Nav.Link as="div">
//                 <Button onClick={handleSignIn}>SignIn</Button>
//               </Nav.Link>
//             )}
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   )
// }

// export default Header
