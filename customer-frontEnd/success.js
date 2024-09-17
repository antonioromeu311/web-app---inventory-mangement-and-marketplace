import Link from 'next/link';
import styles from '@/styles/Home.module.css'
export default function success() {
    if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

    return (
        <>
        <main className={styles.main}>
            <h1>Success!</h1>
            
            <h2>You should receive an email with details, any questions? Email us: <a href="mailto:admin@thefishreef.com">admin@thefishreef.com</a></h2>
            <div>
            <h2><Link href="/">Back to Home</Link></h2>
            </div>
            

          
            </main>
        </>
    );

}
