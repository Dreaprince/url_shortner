import * as bcrypt from 'bcrypt';

export function makeid(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const getYesterdayDate = (): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
  
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
    const day = String(yesterday.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
};

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Number of rounds for salt generation
    return await bcrypt.hash(password, saltRounds);
}

export function generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
  
export function generateId(length: number): string {
    let counter = 0;
    const result = generateRandomString(length);
    counter++;
    return result + '-' + counter;
}

export function generateReferenceNumber(productId: string) {
    const timestamp = Date.now();
    const randomString = generateRandomString(4);
    return `${productId}${timestamp}${randomString}`;
};
  