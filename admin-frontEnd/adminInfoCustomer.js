import Link from 'next/link';
import styles from '@/styles/Home.module.css'
import AdminRoute from 'src/components/AdminRoute';

export default function adminInfoCustomer() {
    return (
        <AdminRoute>
            <>
                <main className={styles.main}>
                    <h1>Customer Information</h1>


                    <h2><Link href="/adminLane/adminLogin">Back to Home</Link></h2>




                </main>
            </>
        </AdminRoute>
    );

}
