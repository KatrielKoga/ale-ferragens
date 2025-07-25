import { MessageCircleMore } from 'lucide-react';

export default function WhatsappButton({ text }: { text: string }) {
  return (
    <a
      href="https://wa.me/5527996912317?text=Olá!%20Gostaria%20de%20mais%20informações%20sobre%20o%20programa%20de%20pontos."
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors duration-300"
    >
      <MessageCircleMore className="h-6 w-6 mr-2" />
      {text}
    </a>
  );
}
