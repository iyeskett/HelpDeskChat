using System.ComponentModel.DataAnnotations;

namespace HelpDeskChat.Models
{
    public class User
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "{0} é obrigatório")]
        [Display(Name = "Nome")]
        public string Name { get; set; } = null!;

        [Required(ErrorMessage = "{0} é obrigatório")]
        [DataType(DataType.EmailAddress)]
        [EmailAddress(ErrorMessage = "Email inválido")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "{0} é obrigatório")]
        [Display(Name = "Senha")]
        [StringLength(25, MinimumLength = 8, ErrorMessage = "{0} deve estar entre {2} e {1} caracteres")]
        [MaxLength(255)]
        public string Password { get; set; } = null!;
    }
}