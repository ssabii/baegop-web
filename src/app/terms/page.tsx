export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">서비스 이용약관</h1>
      <p className="mt-2 text-muted-foreground">시행일: 2026년 3월 2일</p>

      <div className="mt-8 space-y-8 leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">제1조 (목적)</h2>
          <p className="mt-2">
            본 약관은 배곱(이하 &quot;서비스&quot;)이 제공하는 장소 추천 및 관련
            서비스의 이용에 관한 조건과 절차, 이용자와 서비스 간의 권리·의무 및
            책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제2조 (정의)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              &quot;서비스&quot;란 배곱이 제공하는 장소 추천, 장소 정보 제공
              등의 관련 기능 일체를 의미합니다.
            </li>
            <li>
              &quot;이용자&quot;란 본 약관에 동의하고 서비스를 이용하는 자를
              의미합니다.
            </li>
            <li>
              &quot;회원&quot;이란 서비스에 가입하여 계정을 보유한 이용자를
              의미합니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제3조 (약관의 효력 및 변경)</h2>
          <ul className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게
              공지함으로써 효력이 발생합니다.
            </li>
            <li>
              서비스는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 서비스
              내 공지를 통해 안내합니다.
            </li>
            <li>
              이용자가 변경된 약관에 동의하지 않을 경우 서비스 이용을 중단하고
              탈퇴할 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제4조 (회원가입 및 계정)</h2>
          <ul className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              회원가입은 Google 또는 카카오 OAuth를 통해 이루어지며, 가입 시 본
              약관과 개인정보처리방침에 동의한 것으로 간주합니다.
            </li>
            <li>
              이용자는 정확한 정보를 제공해야 하며, 타인의 정보를 도용해서는 안
              됩니다.
            </li>
            <li>계정에 관한 관리 책임은 이용자 본인에게 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            제5조 (서비스의 제공 및 변경)
          </h2>
          <ul className="mt-2 list-decimal space-y-1 pl-5">
            <li>서비스는 장소 추천, 장소 정보 제공 등의 기능을 제공합니다.</li>
            <li>
              서비스는 운영상, 기술상 필요에 따라 제공하는 기능을 변경하거나
              중단할 수 있습니다.
            </li>
            <li>
              서비스 변경 시 사전에 공지하며, 긴급한 경우 사후에 공지할 수
              있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제6조 (이용자의 의무)</h2>
          <p className="mt-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
            <li>
              서비스의 운영을 방해하거나 비정상적인 방법으로 이용하는 행위
            </li>
            <li>다른 이용자의 권리를 침해하거나 불쾌감을 주는 행위</li>
            <li>법령 또는 공서양속에 반하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제7조 (서비스 이용 제한)</h2>
          <p className="mt-2">
            서비스는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을
            방해한 경우, 사전 통지 후 서비스 이용을 제한하거나 계정을 정지할 수
            있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제8조 (면책)</h2>
          <ul className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              서비스는 천재지변, 기술적 장애 등 불가항력으로 인한 서비스 중단에
              대해 책임을 지지 않습니다.
            </li>
            <li>
              서비스에서 제공하는 음식 추천 및 장소 정보는 참고용이며, 이에 따른
              결과에 대해 서비스는 책임을 지지 않습니다.
            </li>
            <li>
              이용자가 등록한 리뷰, 장소 정보 등 사용자 생성 콘텐츠에 대한
              책임은 해당 이용자에게 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제9조 (분쟁 해결)</h2>
          <p className="mt-2">
            서비스 이용과 관련한 분쟁은 대한민국 법률에 따르며, 관할 법원은
            서비스 운영자의 소재지를 관할하는 법원으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">제10조 (문의)</h2>
          <ul className="mt-2 space-y-1">
            <li>서비스명: 배곱</li>
            <li>이메일: ssabi.dev@gmail.com</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
