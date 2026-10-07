import bcrypt from "bcryptjs";

class PasswordUtils {
   // Hash a password
   static async hashPassword(plainPassword, saltRounds) {
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
      return hashedPassword;
   }

   //Verify a password
   static async verifyPassword(plainPassword, hashedPassword) {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
   }
}

export default PasswordUtils;
