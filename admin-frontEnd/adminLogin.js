import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import { Authenticator, Button, Flex, Grid, Card, View, Heading, Divider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AdminRoute from 'src/components/AdminRoute';

const AdminLogin = ({ signOut }) => {



    return (
        <AdminRoute>
            <>


                <main className={styles.main}>
                    <div>
                        <h2>The Fish Reef Admin</h2>
                        <Divider />
                    </div>
                    <Flex>
                        <Grid columnGap="0.5rem"
                            rowGap="0.5rem"
                            templateColumns="1fr 1fr"
                            templateRows="5fr 5fr 5fr">
                            <Button size="large" variation="primary"><Link href="/adminLane/adminSalt">Manage Saltwater Species</Link></Button>
                            <Button size="large" variation="primary"><Link href="/adminLane/adminFresh">Manage Freshwater Species</Link></Button>
                            <Button size="large" variation="primary"><Link href="/adminLane/adminFoodEquip">Manage Food & Equipment</Link></Button>
                            <Button size="large" variation="primary"><Link href="/adminLane/adminContact">Manage Customer Contact Methods</Link></Button>
                            <Button size="large" variation="primary"><Link href="/adminLane/adminInfoCustomer">Manage Customer Info</Link></Button>
                            <Button size="large" variation="primary"><Link href="/adminLane/adminUpcoming">Manage Upcoming Orders</Link></Button>
                        </Grid>
                    </Flex>
                    <Button isFullWidth={true} variation="warning" onClick={signOut}>Sign Out</Button>
                </main>


            </>
        </AdminRoute>
    );

}


export default function AdminLoginPage(props) {
    const { signOut } = props;

    return <AdminLogin signOut={signOut} />;
}