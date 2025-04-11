export class ValidationService {
    public static typingPhone(value: string): string {
        // Usuń wszystko oprócz cyfr i znaku +
        const raw = value.replace(/[^\d+]/g, '');
    
        // Obsługa przypadku, gdy zaczyna się od '+'
        if (raw.startsWith('+')) {
            // Usuń + i zostaw same cyfry
            const digitsOnly = raw.slice(1).replace(/\D/g, '');
            let formatted = '+';
    
            if (digitsOnly.length <= 2) {
                // np. +4 lub +48
                formatted += digitsOnly;
            } else {
                // +48 123 456 789
                const prefix = digitsOnly.slice(0, 2);
                const number = digitsOnly.slice(2, 11); // max 9 cyfr po prefixie
                const parts = number.match(/.{1,3}/g) || [];
                formatted += prefix + ' ' + parts.join(' ');
            }
    
            return formatted.trim();
        } else {
            // Brak prefixu – zostaw tylko cyfry
            const digitsOnly = raw.replace(/\D/g, '').slice(0, 9); // obetnij do 9 cyfr max
    
            if (digitsOnly.length < 9) {
                const parts = digitsOnly.match(/.{1,3}/g) || [];
                return parts.join(' ');
            } else {
                const parts = digitsOnly.match(/.{1,3}/g) || [];
                return `+48 ${parts.join(' ')}`;
            }
        }
    }
    
    public static typingNaming(value: string): string {
        // Usuń wszystkie znaki, które nie są literami, spacjami ani myślnikiem
        const raw = value.replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]/g, '');
    
        // Podzielmy na słowa
        const words = raw.split(/\s+/);
    
        // Przechodzimy po każdym słowie i poprawiamy pierwszą literę na wielką
        const correctedWords = words.map((word) => {
            if (word.length > 0) {
                // Pierwsza litera duża, reszta mała
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return '';
        });
    
        // Łączymy poprawione słowa w jeden ciąg, zachowując przestrzeń między nimi
        return correctedWords.join(' ');
    }

    public static typingAlias(value: string): string {
        // Usuwanie spacji
        const cleanedValue = value.replace(/\s+/g, '');
    
        // Sprawdzanie, czy ciąg zawiera tylko dozwolone znaki (litery, cyfry, znaki specjalne)
        const validAlias = /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>_-]+$/.test(cleanedValue);
    
        // Jeśli alias jest prawidłowy, zwracamy go, w przeciwnym razie zwracamy pusty ciąg
        if (validAlias) {
            return cleanedValue;
        } else {
            return ''; // Możesz zwrócić jakiś komunikat o błędzie, jeśli wolisz
        }
    }
    
}