import { MapPin, Phone, ShieldCheck, Truck } from 'lucide-react';
import WhatsappButton from '@/components/Whatsapp-button';

const AboutSection = () => (
  <section id="about" className="py-20 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Sobre Nós</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Somos a Alê Ferragens, sua parceira de confiança para encontrar as
          melhores ferragens para seus projetos de marcenaria. Oferecemos
          produtos de alta qualidade e um atendimento especializado para
          garantir sua satisfação.
        </p>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Vamos até você!
              </h3>
              <p className="text-gray-600">
                Atendemos o Norte do Espirito Santo e Sul da Bahia
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Qualidade</h3>
              <p className="text-gray-600">
                Produtos selecionados para garantir durabilidade.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">
                Atendimento
              </h3>
              <p className="text-gray-600">
                Aceitamos encomendas e temos suporte por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const ContactSection = () => (
  <section id="contact" className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Contato</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Entre em contato conosco para tirar suas dúvidas ou fazer um
          orçamento. Estamos à sua disposição!
        </p>
      </div>
      <div className="flex flex-col items-center space-y-8">
        <div className="flex items-center space-x-4">
          <MapPin className="h-6 w-6 text-blue-600" />
          <p className="text-gray-700">
            Região Norte do Espirito Santo e Sul da Bahia
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Phone className="h-6 w-6 text-blue-600" />
          <p className="text-gray-700">(11) 98765-4321</p>
        </div>
        <WhatsappButton text="Fale Conosco no WhatsApp" />
      </div>
    </div>
  </section>
);

const Home = () => (
  <div>
    <AboutSection />
    <ContactSection />
  </div>
);

export default Home;
