import { parse, isValid, isAfter, startOfDay } from 'date-fns';

export type EditalStatus = 'Aberto' | 'Autorizado' | 'Comissão Formada' | 'Previsto' | 'Solicitado' | 'Encerrado' | 'N/A';

export function getEditalStatus(registrationEnd: string, examDate: string): EditalStatus {
  const now = startOfDay(new Date());

  const parseConcursoDate = (dateStr: string) => {
    if (!dateStr || /suspenso|definir|cancelado|n\/a/i.test(dateStr)) return null;
    
    // Try DD/MM/YYYY
    let parsed = parse(dateStr, 'dd/MM/yyyy', new Date());
    if (isValid(parsed)) return parsed;

    // Try DD/MM
    parsed = parse(dateStr, 'dd/MM', new Date());
    if (isValid(parsed)) return parsed;

    return null;
  };

  const regDate = parseConcursoDate(registrationEnd);
  const exDate = parseConcursoDate(examDate);

  if (regDate && isAfter(regDate, now)) return 'Aberto';
  // Note: The other statuses like 'Autorizado', 'Previsto' etc usually come from the CSV data directly.
  // This function is a fallback logic based on dates.
  if (exDate && isAfter(exDate, now)) return 'Aberto'; // If there's a future exam date, we can treat as Aberto or just return N/A if we want strictness
  if (regDate || exDate) return 'Encerrado';
  
  return 'N/A';
}

export interface NamedLink {
  name: string;
  url: string;
}

export function parseNamedLinks(linksStr: string | undefined, defaultName: string): NamedLink[] {
  if (!linksStr || linksStr === 'N/A' || linksStr === '') return [];

  return linksStr.split('|').map(item => {
    const trimmedItem = item.trim();
    const colonIndex = trimmedItem.indexOf(':');
    
    if (colonIndex === -1) {
      return { name: defaultName, url: trimmedItem };
    }

    const namePart = trimmedItem.substring(0, colonIndex).trim();
    const urlPart = trimmedItem.substring(colonIndex + 1).trim();

    // Check if namePart is actually a protocol (http/https)
    if (namePart.toLowerCase() === 'http' || namePart.toLowerCase() === 'https') {
      return { name: defaultName, url: trimmedItem };
    }

    return { name: namePart || defaultName, url: urlPart };
  }).filter(link => link.url !== '');
}

export function getStatusConfig(status: EditalStatus) {
  switch (status) {
    case 'Aberto':
      return {
        label: 'Aberto',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
        dotClassName: 'bg-emerald-500',
        description: 'Inscrições abertas ou concurso em andamento'
      };
    case 'Autorizado':
      return {
        label: 'Autorizado',
        className: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
        dotClassName: 'bg-blue-500',
        description: 'Concurso autorizado oficialmente'
      };
    case 'Comissão Formada':
      return {
        label: 'Comissão Formada',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20',
        dotClassName: 'bg-indigo-500',
        description: 'Comissão organizadora já definida'
      };
    case 'Previsto':
      return {
        label: 'Previsto',
        className: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20',
        dotClassName: 'bg-purple-500',
        description: 'Concurso previsto no orçamento ou cronograma'
      };
    case 'Solicitado':
      return {
        label: 'Solicitado',
        className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
        dotClassName: 'bg-amber-500',
        description: 'Pedido de concurso em análise'
      };
    case 'Encerrado':
      return {
        label: 'Encerrado',
        className: 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10',
        dotClassName: 'bg-slate-400',
        description: 'Concurso encerrado'
      };
    default:
      return {
        label: 'N/A',
        className: 'bg-slate-50 text-slate-400 border-slate-200 ring-slate-500/5',
        dotClassName: 'bg-slate-300',
        description: 'Status não identificado'
      };
  }
}
