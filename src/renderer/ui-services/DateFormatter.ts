export class DateFormatter {
    public static formatToDateOnly(date: Date): string {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
    }

    public static formatToDateWithHours(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        // YYYY-MM-DD HH:mm
    }

    public static diffInHoursAndMinutes(start: Date, end: Date): string {
        const diffMs = Math.abs(end.getTime() - start.getTime());
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}`; // HH:mm
    }

     public static formatToInput(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // miesiące są indeksowane od 0
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}