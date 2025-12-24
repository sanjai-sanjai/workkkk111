import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ka', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'mr', name: 'मराठी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'od', name: 'ଓଡିଆ' },
  { code: 'ur', name: 'اردو' },
];

export function LanguageSelector({ isOpen, onClose }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const { setLanguage } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      const selectedLanguage = languages.find(lang => lang.code === languageCode);
      await setLanguage(languageCode);

      // Show toast notification
      if (selectedLanguage) {
        toast.success(t('sync.languageChanged', { language: selectedLanguage.name }) || `Language changed to ${selectedLanguage.name}`, {
          duration: 3000,
        });
      }

      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error(t('common.error') || 'Failed to change language');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-heading">
              {t('common.chooseLanguage')}
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border-border"
          />

          <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
            {filteredLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-lg',
                  'border border-transparent transition-all',
                  'hover:bg-muted/50',
                  i18n.language === language.code
                    ? 'bg-primary/10 border-primary text-primary font-medium'
                    : 'text-foreground'
                )}
              >
                <span>{language.name}</span>
                {i18n.language === language.code && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
