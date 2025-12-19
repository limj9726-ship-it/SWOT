import { Download, FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Database } from '../lib/supabase';

type SwotItem = Database['public']['Tables']['swot_items']['Row'];
type SwotStrategy = Database['public']['Tables']['swot_strategies']['Row'];

type ExportButtonProps = {
  title: string;
  description: string;
  items: SwotItem[];
  strategies: SwotStrategy[];
};

const categoryLabels = {
  strength: 'Forces (Strengths)',
  weakness: 'Faiblesses (Weaknesses)',
  opportunity: 'Opportunités (Opportunities)',
  threat: 'Menaces (Threats)',
};

export default function ExportButton({
  title,
  description,
  items,
  strategies,
}: ExportButtonProps) {
  const handleExportTxt = () => {
    let content = `ANALYSE SWOT\n`;
    content += `${'='.repeat(50)}\n\n`;

    content += `Titre: ${title}\n`;
    if (description) {
      content += `Description: ${description}\n`;
    }
    content += `Date: ${new Date().toLocaleDateString('fr-FR')}\n\n`;

    content += `MATRICE SWOT\n`;
    content += `${'-'.repeat(50)}\n\n`;

    (['strength', 'weakness', 'opportunity', 'threat'] as const).forEach((category) => {
      const categoryItems = items.filter((i) => i.category === category);
      content += `${categoryLabels[category]}:\n`;
      if (categoryItems.length === 0) {
        content += '  (Aucun élément)\n';
      } else {
        categoryItems.forEach((item) => {
          content += `  • ${item.content}\n`;
        });
      }
      content += '\n';
    });

    if (strategies.length > 0) {
      content += `\nSTRATÉGIES\n`;
      content += `${'-'.repeat(50)}\n\n`;

      const strategyLabels: Record<string, string> = {
        SO: 'Maxi-Maxi (Forces + Opportunités)',
        WO: 'Mini-Maxi (Faiblesses + Opportunités)',
        ST: 'Maxi-Mini (Forces + Menaces)',
        WT: 'Mini-Mini (Faiblesses + Menaces)',
      };

      (['SO', 'WO', 'ST', 'WT'] as const).forEach((type) => {
        const typeStrategies = strategies.filter((s) => s.type === type);
        content += `${strategyLabels[type]}:\n`;
        if (typeStrategies.length === 0) {
          content += '  (Aucune stratégie)\n';
        } else {
          typeStrategies.forEach((strategy) => {
            content += `  • ${strategy.description}\n`;
          });
        }
        content += '\n';
      });
    }

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `SWOT-${title}-${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('swot-export-area');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        ignoreElements: (node) => node.tagName === 'BUTTON', // Hide buttons in export
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`SWOT-${title}-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportPDF}
        className="glass-button flex items-center gap-2 px-4 py-2 rounded-lg text-blue-700 hover:text-blue-900 font-medium bg-blue-50/50 hover:bg-blue-100/50"
        title="Exporter en PDF"
      >
        <FileDown className="w-4 h-4" />
        PDF
      </button>
      <button
        onClick={handleExportTxt}
        className="glass-button flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-gray-900 font-medium"
        title="Exporter en TXT"
      >
        <Download className="w-4 h-4" />
        TXT
      </button>
    </div>
  );
}
