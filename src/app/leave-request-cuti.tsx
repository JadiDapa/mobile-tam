import { LeaveRequestFormBody } from '@/components/leave-request-form-body';

export default function LeaveRequestCutiScreen() {
  return (
    <LeaveRequestFormBody
      type="Cuti"
      reasonPlaceholder="Contoh: liburan tahunan bersama keluarga"
      leaveBalanceLabel="8 Hari"
    />
  );
}
