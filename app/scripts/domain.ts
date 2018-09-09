export interface EventsPayload {
  kind: string;
  etag: string;
  summary: string;
  updated: string;
  timeZone: string;
  accessRole: string;
  defaultReminders: DefaultRemindersItem[];
  nextPageToken: string;
  items: CalendarEvent[];
}
interface DefaultRemindersItem {
  method: string;
  minutes: number;
}
export interface CalendarEvent {
  kind: string;
  etag: string;
  id: string;
  status: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary?: string;
  description?: string;
  location?: string;
  creator?: Creator;
  organizer?: Organizer;
  start?: Time;
  end?: Time;
  recurrence?: string[];
  iCalUID?: string;
  sequence?: number;
  attendees?: AttendeesItem[];
  hangoutLink?: string;
  conferenceData?: ConferenceData;
  reminders?: Reminders;
  recurringEventId?: string;
  originalStartTime?: OriginalStartTime;
  guestsCanModify?: boolean;
  extendedProperties?: ExtendedProperties;
  guestsCanInviteOthers?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  transparency?: string;
  visibility?: string;
  attachments?: AttachmentsItem[];
}
interface Creator {
  email: string;
  displayName?: string;
  self?: boolean;
}
interface Organizer {
  email: string;
  displayName?: string;
  self?: boolean;
}
export interface Time {
  dateTime?: string;
  timeZone?: string;
  date?: string;
}
interface AttendeesItem {
  email: string;
  displayName?: string;
  responseStatus: string;
  organizer?: boolean;
  self?: boolean;
  resource?: boolean;
  optional?: boolean;
  comment?: string;
}
interface ConferenceData {
  entryPoints: EntryPointsItem[];
  conferenceSolution: ConferenceSolution;
  conferenceId: string;
  signature: string;
  createRequest?: CreateRequest;
}
interface EntryPointsItem {
  entryPointType: string;
  uri: string;
  label: string;
  pin?: string;
}
interface ConferenceSolution {
  key: Key;
  name: string;
  iconUri: string;
}
interface Key {
  type: string;
}
interface Reminders {
  useDefault: boolean;
}
interface OriginalStartTime {
  dateTime: string;
  timeZone?: string;
}
interface ExtendedProperties {
  private: {
    everyoneDeclinedDismissed: string;
  };
}
interface CreateRequest {
  requestId: string;
  conferenceSolutionKey: ConferenceSolutionKey;
  status: Status;
}
interface ConferenceSolutionKey {
  type: string;
}
interface Status {
  statusCode: string;
}
interface AttachmentsItem {
  fileUrl: string;
  title: string;
  iconLink: string;
  fileId: string;
}
