export interface MeetingRaw {
    day: string;
    start: string;
    end: string;
    room: string;
}

export interface ClassScheduleRaw {
    classId: string;
    className: string;
    meetings: MeetingRaw[];
    lecturers: string[];
    capacity?: number;
}

export interface SubjectRaw {
    subjectId: string;
    code: string;
    name: string;
    sks: number;
    classes: ClassScheduleRaw[];
}
