import React, { useState } from 'react';
import { CampusPass, PassTemplateType } from '../../types';
import { CampusIdPass } from './CampusIdPass';
import { TicketStubPass } from './TicketStubPass';
import { TelegramPass } from './TelegramPass';
import { CityPosterPass } from './CityPosterPass';
import { downloadPassAsPNG } from '../../utils/exportPass';
import { postalSoundFx } from '../../utils/audio';
import { RefreshCw, Download, Share2, Copy, Inbox, Check } from 'lucide-react';

interface Props {
  pass: CampusPass;
  onUpdateTemplate?: (newTemplate: PassTemplateType) => void;
  onGoToWallet?: () => void;
  onGoToMailbox?: () => void;
}

const TEMPLATES: PassTemplateType[] = ['campus_id', 'ticket_stub', 'telegram', 'city_poster'];

export const PassContainer: React.FC<Props> = ({
  pass,
  onUpdateTemplate,
  onGoToWallet,
  onGoToMailbox,
}) => {
  const [currentTemplate, setCurrentTemplate] = useState<PassTemplateType>(pass.template);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const cycleTemplate = () => {
    postalSoundFx.playTypewriterTick();
    const curIdx = TEMPLATES.indexOf(currentTemplate);
    const nextIdx = (curIdx + 1) % TEMPLATES.length;
    const nextTpl = TEMPLATES[nextIdx];
    setCurrentTemplate(nextTpl);
    if (onUpdateTemplate) {
      onUpdateTemplate(nextTpl);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Campus Post Entry Pass — ${pass.eventTitle}`,
      text: `I'm registered for ${pass.eventTitle}! Entry Code: ${pass.code}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    postalSoundFx.playTypewriterTick();
    navigator.clipboard.writeText(`${window.location.origin}#pass=${pass.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleDownload = async (format: '9:16' | '1:1') => {
    setDownloading(true);
    setShowDownloadOptions(false);
    try {
      await downloadPassAsPNG({ ...pass, template: currentTemplate }, format);
      postalSoundFx.playStampThump();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto py-2">
      {/* Pass Template Component */}
      <div className="flex justify-center w-full transition-all duration-300">
        {currentTemplate === 'campus_id' && (
          <CampusIdPass pass={{ ...pass, template: currentTemplate }} />
        )}
        {currentTemplate === 'ticket_stub' && (
          <TicketStubPass pass={{ ...pass, template: currentTemplate }} />
        )}
        {currentTemplate === 'telegram' && (
          <TelegramPass pass={{ ...pass, template: currentTemplate }} />
        )}
        {currentTemplate === 'city_poster' && (
          <CityPosterPass pass={{ ...pass, template: currentTemplate }} />
        )}
      </div>

      {/* Template Label */}
      <div className="flex items-center gap-2 font-typewriter text-xs text-[#FFF6E5]/80">
        <span>PASS TEMPLATE:</span>
        <span className="font-bold text-[#F3E6CE] bg-[#2A1A14] px-2.5 py-0.5 rounded border border-[#FFF6E5]/30">
          {currentTemplate === 'campus_id' && '1. Campus ID Pass'}
          {currentTemplate === 'ticket_stub' && '2. Event Ticket Stub'}
          {currentTemplate === 'telegram' && '3. Telegram Strip'}
          {currentTemplate === 'city_poster' && '4. City Poster (9:16)'}
        </span>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        <button
          onClick={cycleTemplate}
          className="btn-postal-kraft flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Remix My Pass</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            disabled={downloading}
            className="btn-postal-cream flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase"
          >
            <Download className="w-3.5 h-3.5 text-[#8E2A2A]" />
            <span>{downloading ? 'Rendering...' : 'Download PNG'}</span>
          </button>

          {showDownloadOptions && (
            <div className="absolute bottom-full mb-2 left-0 w-44 bg-[#F3E6CE] border-2 border-[#2A1A14] rounded-xl p-1.5 shadow-[4px_4px_0px_#2A1A14] z-30 flex flex-col gap-1 font-typewriter">
              <button
                onClick={() => handleDownload('9:16')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-[#2A1A14] hover:bg-[#A98258] hover:text-[#FFF6E5] rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Poster (9:16)</span>
                <span className="text-[10px] opacity-70">1080×1920</span>
              </button>
              <button
                onClick={() => handleDownload('1:1')}
                className="w-full text-left px-3 py-2 text-xs font-bold text-[#2A1A14] hover:bg-[#A98258] hover:text-[#FFF6E5] rounded-lg transition-colors flex items-center justify-between"
              >
                <span>Square (1:1)</span>
                <span className="text-[10px] opacity-70">1080×1080</span>
              </button>
            </div>
          )}
        </div>

        {(onGoToWallet || onGoToMailbox) && (
          <button
            onClick={onGoToWallet || onGoToMailbox}
            className="btn-postal-cream flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase"
          >
            <Inbox className="w-3.5 h-3.5 text-[#5B7A3A]" />
            <span>View In Passes</span>
          </button>
        )}

        <button
          onClick={handleShare}
          className="btn-postal-cream flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs uppercase"
        >
          <Share2 className="w-3.5 h-3.5 text-[#8A1F6E]" />
          <span>Share Pass</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="btn-postal-cream flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs uppercase"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#5B7A3A]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
        </button>
      </div>
    </div>
  );
};
