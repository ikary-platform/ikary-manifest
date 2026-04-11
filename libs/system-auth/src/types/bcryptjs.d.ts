declare module 'bcryptjs' {
  interface BcryptJsModule {
    hash(password: string, rounds: number): Promise<string>;
    compare(password: string, hash: string): Promise<boolean>;
  }

  const bcrypt: BcryptJsModule;

  export default bcrypt;
}
