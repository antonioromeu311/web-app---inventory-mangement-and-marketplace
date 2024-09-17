import Link from 'next/link';
import styles from '@/styles/Home.module.css'
export default function success() {
   

    return (
        <>
        <main className={styles.main}>
            <h1>Terms and conditions</h1>
            
            <h2>Our site will extract the following attribtues from your inventory products:
                Name, Description, Price, Image, Inventory Quantity, SKU
            </h2>

            <h3>Questions? Email us at: <u><Link href=""</Link></u></h3>
            <div>
            <h2><Link href="/">Back to Home</Link></h2>
            </div>
            

          
            </main>
        </>
    );

}
