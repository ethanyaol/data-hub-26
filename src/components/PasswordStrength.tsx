interface Props {
  password: string;
}

const PasswordStrength = ({ password }: Props) => {
  if (!password) return null;

  const checks = [
    { label: "至少8位", pass: password.length >= 8 },
    { label: "大写字母", pass: /[A-Z]/.test(password) },
    { label: "小写字母", pass: /[a-z]/.test(password) },
    { label: "数字", pass: /[0-9]/.test(password) },
    { label: "特殊字符", pass: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const strength = passed <= 2 ? "弱" : passed <= 4 ? "中" : "强";
  const strengthColor = passed <= 2 ? "bg-destructive" : passed <= 4 ? "bg-warning" : "bg-success";

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= passed ? strengthColor : "bg-muted"
            }`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`text-xs ${c.pass ? "text-success" : "text-muted-foreground"}`}
          >
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
        <span className="text-xs ml-auto font-medium text-muted-foreground">
          强度: {strength}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrength;
