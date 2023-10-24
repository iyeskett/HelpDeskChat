using System.Security.Cryptography;

namespace HelpDeskChat.Services
{
    public class PasswordEncryptor
    {
        // Método para criptografar a senha
        public static string EncryptPassword(string password)
        {
            // Gerar um salt aleatório
            byte[] salt;
            new RNGCryptoServiceProvider().GetBytes(salt = new byte[16]);

            // Criar o derivador de bytes usando o algoritmo SHA-256
            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);

            // Obter o hash da senha
            byte[] hash = pbkdf2.GetBytes(20);

            // Combina o salt com o hash para armazenamento seguro
            byte[] hashWithSalt = new byte[36];
            Array.Copy(salt, 0, hashWithSalt, 0, 16);
            Array.Copy(hash, 0, hashWithSalt, 16, 20);

            // Converter o resultado para uma string base64 para armazenamento no banco de dados
            return Convert.ToBase64String(hashWithSalt);
        }

        // Método para verificar a senha fornecida com a senha criptografada no banco de dados
        public static bool VerifyPassword(string password, string hashedPassword)
        {
            // Converter a senha criptografada de base64 para bytes
            byte[] hashWithSalt = Convert.FromBase64String(hashedPassword);

            // Extrair o salt e o hash da senha criptografada
            byte[] salt = new byte[16];
            Array.Copy(hashWithSalt, 0, salt, 0, 16);

            byte[] hash = new byte[20];
            Array.Copy(hashWithSalt, 16, hash, 0, 20);

            // Criar o derivador de bytes usando o mesmo salt e número de iterações
            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);

            // Obter o hash da senha fornecida
            byte[] testHash = pbkdf2.GetBytes(20);

            // Comparar os hashes
            for (int i = 0; i < 20; i++)
            {
                if (hash[i] != testHash[i])
                    return false;
            }
            return true;
        }
    }
}