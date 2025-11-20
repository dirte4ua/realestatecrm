'use client';

interface TimePickerProps {
    value: string;
    onChange: (time: string) => void;
    required?: boolean;
}

export default function TimePicker({ value, onChange, required }: TimePickerProps) {
    // Parse the current time value (HH:MM format)
    const [hour, minute] = value ? value.split(':') : ['09', '00'];
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute) || 0;

    // Determine AM/PM and 12-hour format
    const isPM = hourNum >= 12;
    const hour12 = hourNum === 0 ? 12 : (hourNum > 12 ? hourNum - 12 : hourNum);

    // Generate time options
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 4 }, (_, i) => i * 15); // 15-minute increments: 0, 15, 30, 45

    const handleChange = (newHour12: number, newMinute: number, newIsPM: boolean) => {
        // Convert back to 24-hour format
        let hour24 = newHour12;
        if (newIsPM && newHour12 !== 12) {
            hour24 = newHour12 + 12;
        } else if (!newIsPM && newHour12 === 12) {
            hour24 = 0;
        }

        const timeString = `${String(hour24).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}`;
        onChange(timeString);
    };

    return (
        <div className="flex gap-2">
            <select
                value={hour12}
                onChange={(e) => handleChange(parseInt(e.target.value), minuteNum, isPM)}
                required={required}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 flex-1"
            >
                {hours.map((h) => (
                    <option key={h} value={h}>
                        {h}
                    </option>
                ))}
            </select>

            <select
                value={minuteNum}
                onChange={(e) => handleChange(hour12, parseInt(e.target.value), isPM)}
                required={required}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 flex-1"
            >
                {minutes.map((m) => (
                    <option key={m} value={m}>
                        {String(m).padStart(2, '0')}
                    </option>
                ))}
            </select>

            <select
                value={isPM ? 'PM' : 'AM'}
                onChange={(e) => handleChange(hour12, minuteNum, e.target.value === 'PM')}
                required={required}
                className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
}
