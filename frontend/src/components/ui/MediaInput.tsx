import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { isHtmlEmbed } from '../../utils/embed';
import {
    isPendingMedia,
    peekPendingPreview,
    releasePendingMedia,
    retainPendingMedia,
    stashPendingMedia,
    type MediaFolder,
} from '../../utils/pendingMedia';

export type { MediaFolder };

interface MediaInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    folder: MediaFolder;
    allowEmbed?: boolean;
    required?: boolean;
    helpText?: string;
}

const MediaInput: React.FC<MediaInputProps> = ({
    label,
    value,
    onChange,
    folder,
    allowEmbed = false,
    required = false,
    helpText,
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [showUrl, setShowUrl] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);

    useEffect(() => {
        if (!isPendingMedia(value)) return undefined;
        retainPendingMedia(value);
        return () => releasePendingMedia(value);
    }, [value]);

    const isEmbed = isHtmlEmbed(value);
    const previewSrc = peekPendingPreview(value) || (!isPendingMedia(value) && !isEmbed ? value : '');
    const hasPreview = Boolean(previewSrc);

    const handleFile = (file: File | undefined) => {
        if (!file) return;
        onChange(stashPendingMedia(file, folder));
        setShowUrl(false);
        setShowEmbed(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {label}
                {required ? ' *' : ''}
            </label>
            {helpText && <p className="text-xs text-neutral-500 dark:text-neutral-400">{helpText}</p>}

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                        className="hidden"
                        onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => fileRef.current?.click()}
                    >
                        Escolher arquivo
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setShowUrl((open) => !open);
                            setShowEmbed(false);
                        }}
                    >
                        Colar URL
                    </Button>
                    {allowEmbed && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setShowEmbed((open) => !open);
                                setShowUrl(false);
                            }}
                        >
                            Colar embed
                        </Button>
                    )}
                    {value && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
                            Remover
                        </Button>
                    )}
                </div>

                {showUrl && (
                    <input
                        type="url"
                        value={isEmbed || isPendingMedia(value) ? '' : value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://..."
                        className="input-field w-full text-sm"
                    />
                )}

                {allowEmbed && showEmbed && (
                    <textarea
                        rows={3}
                        value={isPendingMedia(value) ? '' : value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Cole o HTML do Instagram, iframe, ou o link da publicação"
                        className="input-field w-full text-xs font-mono resize-y"
                    />
                )}

                {hasPreview && (
                    <img src={previewSrc} alt="" className="h-24 w-full object-cover rounded-2xl border border-neutral-200 dark:border-neutral-700" />
                )}
                {isEmbed && (
                    <div className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 rounded-2xl px-3 py-2">
                        Embed HTML salvo
                    </div>
                )}
                {!hasPreview && !isEmbed && value && (
                    <p className="text-[11px] text-neutral-500 truncate">{value}</p>
                )}
            </div>

            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value}
                    onChange={() => undefined}
                    className="sr-only"
                    aria-hidden="true"
                />
            )}
        </div>
    );
};

export default MediaInput;
