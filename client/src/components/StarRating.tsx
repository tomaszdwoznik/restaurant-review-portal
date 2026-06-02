import { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
    value: number;
    onChange: (v: number) => void;
    max?: number;
}

export default function StarRating({ value, onChange, max = 5 }: Props) {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-2" onMouseLeave={() => setHover(0)}>
            <div className="flex gap-0.5">
                {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
                    const active = n <= (hover || value);
                    return (
                        <button
                            key={n}
                            type="button"
                            onClick={() => onChange(n)}
                            onMouseEnter={() => setHover(n)}
                            aria-label={`Ocena ${n}`}
                            className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                        >
                            <Star
                                className={`h-7 w-7 transition-colors duration-200 ${
                                    active 
                                        ? 'fill-amber-400 text-amber-400' 
                                        : 'fill-stone-200 text-stone-200 hover:fill-amber-200 hover:text-amber-200'
                                }`}
                            />
                        </button>
                    );
                })}
            </div>
            <span className="ml-1 rounded-lg bg-white px-2 py-1 text-xs font-bold text-stone-600 shadow-sm border border-stone-200">
                {value} / {max}
            </span>
        </div>
    );
}