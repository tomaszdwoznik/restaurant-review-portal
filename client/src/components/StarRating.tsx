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
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
                const active = n <= (hover || value);
                return (
                    <button
                        key={n}
                        type="button"
                        onClick={() => onChange(n)}
                        onMouseEnter={() => setHover(n)}
                        aria-label={`Ocena ${n}`}
                        className="transition hover:scale-110"
                    >
                        <Star
                            className={`h-7 w-7 ${active ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`}
                        />
                    </button>
                );
            })}
            <span className="ml-2 text-sm text-gray-500">{value}/{max}</span>
        </div>
    );
}