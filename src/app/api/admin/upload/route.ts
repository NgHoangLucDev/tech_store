import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 });
    }

    // Đọc buffer file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Đảm bảo thư mục public/uploads tồn tại
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Tạo tên file độc nhất bằng timestamp để tránh trùng lặp
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${timestamp}_${cleanName}`;
    const filePath = join(uploadDir, filename);

    // Ghi file xuống ổ đĩa
    await writeFile(filePath, buffer);
    console.log(`Saved file to: ${filePath}`);

    // Trả về đường dẫn tương đối phục vụ qua Next.js static files
    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error('File Upload Error:', error);
    return NextResponse.json({ error: 'Lỗi tải tệp: ' + error.message }, { status: 500 });
  }
}
