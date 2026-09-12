Avatar/profile-photo fix:
- getFileUrl now handles Windows absolute upload paths and old localhost:8000 URLs.
- Missing avatar uses /default-avatar.svg.
- Main candidate/recruiter/admin avatar images have an onError fallback.
- Backend must serve GET /uploads/* (the supplied backend does this).
