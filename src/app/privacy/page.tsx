export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">개인정보처리방침</h1>
      <p className="mt-2 text-muted-foreground">시행일: 2026년 3월 2일</p>

      <div className="mt-8 space-y-8 leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">
            1. 개인정보의 수집 및 이용 목적
          </h2>
          <p className="mt-2">
            배곱(이하 &quot;서비스&quot;)은 다음의 목적을 위해 개인정보를 수집
            및 이용합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>회원 식별 및 로그인 인증</li>
            <li>서비스 제공 및 장소 추천</li>
            <li>서비스 개선 및 신규 기능 개발</li>
            <li>문의 대응 및 공지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. 수집하는 개인정보 항목</h2>
          <p className="mt-2">
            서비스는 Google 및 카카오 OAuth를 통해 다음 항목을 수집합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이메일 주소</li>
            <li>이름</li>
            <li>프로필 이미지</li>
          </ul>
          <p className="mt-2">
            서비스 이용 과정에서 닉네임, 장소, 리뷰 등의 정보가 추가로 생성 및
            저장될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            3. 개인정보의 보유 및 이용 기간
          </h2>
          <p className="mt-2">
            회원 탈퇴 시 수집된 개인정보는 지체 없이 파기합니다. 단, 관련 법령에
            따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              전자상거래 등에서의 소비자 보호에 관한 법률: 계약 또는 청약철회에
              관한 기록 5년
            </li>
            <li>통신비밀보호법: 접속 로그 기록 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. 개인정보의 제3자 제공</h2>
          <p className="mt-2">
            서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의한 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            5. 개인정보의 파기 절차 및 방법
          </h2>
          <p className="mt-2">
            이용 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일
            형태의 정보는 복구할 수 없는 방법으로 삭제하며, 종이 문서는
            분쇄하거나 소각하여 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. 이용자의 권리</h2>
          <p className="mt-2">
            이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제, 처리
            정지를 요청할 수 있습니다. 회원 탈퇴를 통해 개인정보 삭제를 요청할
            수 있으며, 아래 연락처로 직접 요청하실 수도 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">
            7. 개인정보의 안전성 확보 조치
          </h2>
          <p className="mt-2">
            서비스는 개인정보의 안전성 확보를 위해 다음 조치를 취하고 있습니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>데이터 암호화 전송 (HTTPS/TLS)</li>
            <li>접근 권한 제한 및 관리</li>
            <li>인증 정보의 암호화 저장</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">8. 개인정보 보호책임자</h2>
          <ul className="mt-2 space-y-1">
            <li>서비스명: 배곱</li>
            <li>이메일: ssabi.dev@gmail.com</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">9. 개인정보처리방침의 변경</h2>
          <p className="mt-2">
            본 방침은 시행일로부터 적용되며, 변경 사항이 있을 경우 서비스 내
            공지를 통해 안내합니다.
          </p>
        </section>
      </div>
    </div>
  );
}
