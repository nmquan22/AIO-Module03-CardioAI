# Giai đoạn 1: Sử dụng một image Python chính thức làm image cơ sở
# python:3.9-slim là một phiên bản nhẹ, giúp image cuối cùng nhỏ hơn
FROM python:3.9-slim

# Giai đoạn 2: Thiết lập thư mục làm việc bên trong container
# Tất cả các lệnh sau này sẽ được chạy từ thư mục /app
WORKDIR /app

# Giai đoạn 3: Cài đặt các thư viện cần thiết
# Đầu tiên, sao chép chỉ file requirements.txt vào container
COPY requirements.txt .

# Chạy lệnh pip install để cài đặt tất cả các thư viện được liệt kê
# --no-cache-dir giúp giảm kích thước của image
# --trusted-host pypi.python.org giúp tránh các lỗi mạng khi tải thư viện
RUN pip install --no-cache-dir --trusted-host pypi.python.org -r requirements.txt

# Giai đoạn 4: Sao chép toàn bộ mã nguồn của dự án vào container
# Dấu "." đầu tiên đại diện cho toàn bộ thư mục dự án trên máy của bạn
# Dấu "." thứ hai đại diện cho thư mục làm việc hiện tại trong container (/app)
COPY . .

# Lệnh để chạy ứng dụng sẽ được định nghĩa trong file docker-compose.yml,
# vì vậy chúng ta không cần lệnh CMD hoặc ENTRYPOINT ở đây.

