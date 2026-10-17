import type { Metadata } from "next";
import { ButtonLink } from "@/components/button-link";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <h1 className="text-8xl">
        <span className="sr-only">Lỗi </span>404
      </h1>
      <p className="mt-6 text-2xl">Không tìm thấy trang này.</p>
      <p className="mt-4 mb-8 text-lg text-brand-ink-muted">
        Trang có thể đã đổi địa chỉ. Mời bạn về trang chủ Boongee.
      </p>
      <ButtonLink href="/" variant="primary">
        Về trang chủ
      </ButtonLink>
    </section>
  );
}
