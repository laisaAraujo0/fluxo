import { MapPin, Mail, Github, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const linksRapidos = [
    { label: 'Sobre', href: '/sobre' },
    { label: 'Contato', href: '/contato' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Ajuda', href: '/ajuda' },
  ];

  const linksLegais = [
    { label: 'Termos de Uso', href: '/termos' },
    { label: 'Privacidade', href: '/privacidade' },
  ];

  const redesSociais = [
    // Nota: O linter pode estar indicando que 'Github' e 'Instagram' estão depreciados.
    // Usamos os nomes diretamente, mas se houver problemas de importação, 
    // substitua por alternativas como 'GitHubIcon' ou 'InstagramIcon' (se existirem na sua biblioteca).
    { icon: Github, href: 'https://github.com/laisaAraujo0/fluxo', label: 'GitHub' },
    { icon: Instagram, href: 'https://instagram.com/app_fluxo', label: 'Instagram' },
  ];

  return (
    <footer className="bg-background border-t border-border">
      {/* Seção Principal do Footer */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna da Marca */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">
                FLUXO
              </span>
            </div>
            
            <p className="text-muted-foreground text-sm mb-4">
              Conectando cidadãos e governo para construir cidades melhores.
            </p>

            {/* Informações de Contato */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>fluxoproblemasurbanos@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Coluna Links Rápidos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              {/* CORREÇÃO LINTER: Usando 'link.label' como key ao invés de 'index' */}
              {linksRapidos.map((link) => ( 
                <li key={link.label}>
                  <Link 
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna Redes Sociais */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Siga-nos</h4>
            <div className="flex space-x-3">
              {/* CORREÇÃO LINTER: Usando 'rede.label' como key ao invés de 'index' */}
              {redesSociais.map((rede) => {
                const Icon = rede.icon;
                return (
                  <Button
                    key={rede.label} // Usando o label da rede social
                    variant="outline"
                    size="icon"
                    asChild
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <a 
                      href={rede.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-label={rede.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Seção Inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} FLUXO. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center space-x-4">
              {/* CORREÇÃO LINTER: Usando 'link.label' como key ao invés de 'index' */}
              {linksLegais.map((link) => (
                <Link 
                  key={link.label} // Usando o label do link legal
                  to={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          {/* Adicionei uma div vazia aqui para manter o layout 'justify-between' se necessário */}
          <div className="text-sm text-muted-foreground flex items-center space-x-1 mt-4 md:mt-0">
             Feito com <Heart className="h-3 w-3 text-red-500 fill-red-500"/> para cidades melhores.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;