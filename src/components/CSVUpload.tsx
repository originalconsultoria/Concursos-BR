import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { useConcursoStore, Concurso } from '../store';

export const CSVUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setConcursos, concursos: existingConcursos } = useConcursoStore();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // Set delimiter to semicolon
      complete: (results) => {
        const parsedData = results.data as any[];
        const seenIds = new Set<string>();
        const newConcursos: Concurso[] = [];

        parsedData.forEach((row, index) => {
          // Map CSV headers to our Concurso interface
          const baseId = `${row.Orgao}-${row.Link || index}`;
          let id = baseId;
          let counter = 1;
          while (seenIds.has(id)) {
            id = `${baseId}-${counter}`;
            counter++;
          }
          seenIds.add(id);
          
          // Check if we already have this concurso to preserve interest_status and notes
          const existing = existingConcursos.find(c => c.id === id);

          newConcursos.push({
            id,
            source: row.Fonte || 'N/A',
            institution: row.Orgao || 'N/A',
            location: row.UF || 'N/A',
            board: row.Banca || 'A Definir',
            vacancies: row.Vagas || 'N/A',
            salary: row.Salario || 'N/A',
            registration_end: row.Fim_Inscricoes || 'N/A',
            exemption_period: row.Periodo_Isencao || 'N/A',
            exam_date: row.Data_Prova || 'A Definir',
            link: row.Link || '',
            Link_Edital: row.Link_Edital || '',
            Link_Inscricao: row.Link_Inscricao || '',
            positions: row.Cargos || 'N/A',
            subjects: row.Disciplinas || 'N/A',
            esfera: row.Esfera || 'N/A',
            modalidade: row.Modalidade || 'N/A',
            status: row.Status || 'N/A',
            etapas: row.Etapas || 'N/A',
            duplicadas: row.Duplicadas || 'N/A',
            interest_status: existing?.interest_status || 'none',
            is_enrolled: existing?.is_enrolled || false,
            exam_location: existing?.exam_location,
            notes: existing?.notes,
            latitude: existing?.latitude,
            longitude: existing?.longitude,
          });
        });

        setConcursos(newConcursos);
        alert(`${newConcursos.length} concursos carregados com sucesso!`);
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error);
        alert('Erro ao processar o arquivo CSV.');
      }
    });
  };

  return (
    <div className="flex items-center w-full">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm md:text-base"
      >
        <Upload size={18} />
        <span>Upload de CSV</span>
      </button>
    </div>
  );
};
