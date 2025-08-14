Phạm vi Sprint 1
Auth + Onboarding (chọn level/skills).

Home Feed (cá nhân hoá cơ bản).

Explore (danh sách + lọc).

Post Detail + Comment Thread + Vote + Report.

Create/Edit Post + Upload Media + Publish.

Search cơ bản.

Ngoài phạm vi: AI Lab, Artifacts (quiz/flashcards), Moderation dashboard, Notifications, Admin.

1) Auth & Onboarding
1.1 /login
Form email/password, nút “Đăng nhập”.

Sau khi login thành công, gọi GET /v1/auth/me → nếu chưa onboarding thì chuyển /onboarding, ngược lại về /feed.

API dùng

POST /v1/auth/login

GET /v1/auth/me

(tuỳ chọn) POST /v1/auth/logout

(tuỳ chọn) POST /v1/auth/token/refresh

State/UX

Loading button, hiển thị lỗi 401/invalid credential.

Lưu token, set interceptor refresh.

1.2 /register
Form đăng ký tối giản (email, password).

Đăng ký xong → /onboarding.

API: POST /v1/auth/register, GET /v1/auth/me

1.3 /onboarding
Bước 1: Chọn Level (A1–C2) → GET /v1/levels

Bước 2: Chọn Skills (multi) → GET /v1/skills

Lưu hồ sơ → PATCH /v1/profiles/:id

Xong chuyển /feed.

State/UX

Disable tiếp tục khi chưa chọn level.

Persist tạm vào localStorage nếu reload.

2) Home Feed
2.1 /feed
Thanh filter nhanh: Level (dropdown), Skills (chips, multi).

Danh sách card bài viết (title, tác giả, chips tag, score, thời gian).

Action: Upvote/Downvote ngay trên card (optimistic).

API

GET /v1/feed?page=&limit=&level=&skills=

POST /v1/posts/:id/votes { value: 1|-1 }

State/UX

Skeleton list khi tải đầu.

Infinite scroll/“Load more”.

Optimistic vote + rollback khi lỗi.

3) Explore & Search
3.1 /explore
Tabs: Trending (hot), New, Top.

Bộ lọc: Tag (autocomplete), Level, Skills.

List giống /feed.

API

GET /v1/posts?tag=&level=&skills=&sort=hot|new|top&page=&limit=

GET /v1/tags (để build picker)

(dùng lại) GET /v1/levels, GET /v1/skills

3.2 /search
Thanh search global (header) điều hướng tới /search?q=....

Kết quả: danh sách bài viết khớp query.

API

GET /v1/search?q=&tags=&level=&type=post&page=&limit=

State/UX

Debounce 300–500ms khi gõ.

Hiển thị “No result” + gợi ý tag.

4) Post Detail + Thread
4.1 /posts/:id
Hiển thị title, tác giả, thời gian, content (Markdown), tags, level, skills.

Nút Vote, Report (menu 3 chấm).

Khối Comments (threaded): form reply, list theo thời gian.

API

Chi tiết bài: GET /v1/posts/:id

Vote bài: POST /v1/posts/:id/votes

Report bài: POST /v1/posts/:id/report {reason}

State/UX

Anchor #comment-:id để deep-link.

4.2 Comments
List comment theo thread (cấp 1), mỗi comment có nút “Xem reply” (lazy load).

Form thêm comment (Markdown mini).

API

Lấy comment: GET /v1/posts/:id/comments?page=&limit=

Tạo comment: POST /v1/posts/:id/comments {content, parentId?}

Vote comment: POST /v1/comments/:id/votes { value: 1|-1 }

Report comment: POST /v1/comments/:id/report {reason}

State/UX

Optimistic khi gửi comment/vote, rollback nếu lỗi.

“Load more replies” cho thread dài.

5) Create / Edit / Publish Post
5.1 /post/new
Editor (Markdown + upload media).

Chọn Tag (autocomplete), Level (single), Skills (multi).

Nút Save Draft, Publish (disabled khi chưa đủ điều kiện: tối thiểu title + content).

API

Tạo draft: POST /v1/posts

Upload media:

POST /v1/media/sign {mime, filename} → {uploadUrl, publicUrl}

Upload trực tiếp tới storage → xong gọi POST /v1/media/complete (ghi DB)

Cập nhật draft: PATCH /v1/posts/:id

Publish: POST /v1/posts/:id/publish (202: queued moderation)

Picker dữ liệu: GET /v1/tags, GET /v1/levels, GET /v1/skills

State/UX

Autosave (debounce 1–2s) gọi PATCH /v1/posts/:id.

Toast trạng thái publish: “Bài đang chờ kiểm duyệt”.

5.2 /post/:id/edit
Nạp lại draft, cho phép chỉnh title/content/tags/level/skills/media.

API: GET /v1/posts/:id, PATCH /v1/posts/:id, media APIs như trên.

6) Thành phần dùng chung (components)
PostCard: dùng ở /feed, /explore, /search.

APIs: vote bài.

VoteButtons: (post/comment).

APIs: POST /v1/posts/:id/votes, POST /v1/comments/:id/votes

TagPicker / LevelSelect / SkillsSelect

APIs: GET /v1/tags, GET /v1/levels, GET /v1/skills

MarkdownEditor + MediaUploader

APIs: POST /v1/media/sign, POST /v1/media/complete

Pagination / InfiniteScroll, Skeletons, EmptyState, Toast.

7) Checklist QA (theo flow)
Auth

Đăng nhập sai/đúng; refresh token; redirect onboarding.

Onboarding

Lấy danh mục level/skills; lưu profile; reload giữa chừng không mất dữ liệu.

Feed

Lọc theo level/skills; vote optimistic; rollback khi 4xx/5xx.

Explore

Lọc tag/level/skills; sort hot/new/top; phân trang.

Search

Debounce; không query rỗng; no result state.

Post Detail

Render Markdown; vote/report; anchor comment.

Comments

Tạo/sửa (nếu có)/xoá (nếu có) – tối thiểu tạo + vote + report; load replies theo trang.

Create/Edit/Publish

Upload ảnh/âm thanh hoạt động (sign → upload → complete); autosave; publish disabled khi thiếu field; thông báo khi publish 202.

8) Danh sách API cần thiết cho Sprint 1
Auth
POST /v1/auth/register

POST /v1/auth/login

POST /v1/auth/logout (tuỳ chọn)

POST /v1/auth/token/refresh (tuỳ chọn)

GET /v1/auth/me

Profile & Onboarding
GET /v1/levels

GET /v1/skills

PATCH /v1/profiles/:id

Feed / Explore / Search
GET /v1/feed?page=&limit=&level=&skills=

GET /v1/posts?tag=&level=&skills=&sort=hot|new|top&page=&limit=

GET /v1/tags

GET /v1/search?q=&tags=&level=&type=post&page=&limit=

Post Detail + Vote + Report + Comments
GET /v1/posts/:id

POST /v1/posts/:id/votes {value:1|-1}

POST /v1/posts/:id/report {reason}

GET /v1/posts/:id/comments?page=&limit=

POST /v1/posts/:id/comments {content, parentId?}

POST /v1/comments/:id/votes {value:1|-1}

POST /v1/comments/:id/report {reason}

Create / Edit / Publish / Media
POST /v1/posts (create draft)

PATCH /v1/posts/:id (update draft)

POST /v1/posts/:id/publish

POST /v1/media/sign {mime, filename}

POST /v1/media/complete {postId, url, kind, meta}

