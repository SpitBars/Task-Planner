# Privacy Policy (Student Productivity Hub)

This is a personal integration service you run for yourself.

## Data we process
- Google Calendar data (events you list/create/update/delete through the service)
- Notion task data (tasks you list/create/update through the service)
- Canvas items (assignments fetched using your Canvas token)
- Timetable items (iCal URLs you configure)
- Optional webhook payloads you send from your phone

## Where data is stored
- A local SQLite database (`student_hub.sqlite`) stores encrypted third-party tokens (Google OAuth token bundle).
- Notion/Canvas data is not permanently stored by default; it is fetched on demand.
- Server logs may contain request metadata (avoid logging secrets).

## Sharing
Data is not sold or shared with third parties, except when calling the APIs you configured (Google/Notion/Canvas).

## Retention & deletion
To delete everything: stop the server and delete:
- `student_hub.sqlite`
- any `.env`/secrets files
- the Google/Notion/Canvas tokens you created (revoke them from the provider settings)

## Security
- Protect `HUB_API_KEY` and `MASTER_KEY`.
- Use HTTPS when hosting publicly.
- Use minimum scopes needed.

Contact: (your email)
Effective date: (set a date)
