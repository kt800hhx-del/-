"use client";

import { CITIES, COMMON_STACK, EDUCATION_OPTIONS, INTERESTS, SAMPLE_BACKGROUND } from "@/lib/constants";
import { extractSkillsFromText, uniqueNormalized } from "@/lib/match";
import type { UserBackground } from "@/lib/types";
import { Button, Chip, Field, Select, TextArea, TextInput } from "../ui";

export function BackgroundStep({
  background,
  onChange,
}: {
  background: UserBackground;
  onChange: (next: UserBackground) => void;
}) {
  const patch = (partial: Partial<UserBackground>) => onChange({ ...background, ...partial });

  const addStack = (value: string) => {
    patch({ techStack: uniqueNormalized([...background.techStack, value]) });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs tracking-[0.22em] text-celadon">第一步 · 输入</p>
        <h2 className="font-serif text-3xl leading-tight text-ink">先把背景放进来</h2>
        <p className="max-w-2xl text-sm leading-7 text-muted">
          方法论是固定的：背景只作为输入，不会因此编造捷径。字段都可以空着继续，但信息越少，后面的假设会越多。
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => onChange(SAMPLE_BACKGROUND)}>
            填入示例背景
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              patch({
                techStack: uniqueNormalized([
                  ...background.techStack,
                  ...extractSkillsFromText(`${background.resumeText}\n${background.projectNotes}\n${background.currentRole}`),
                ]),
              })
            }
          >
            从文本识别技能
          </Button>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="称呼（选填）">
          <TextInput
            value={background.name}
            placeholder="例如：林同学"
            onChange={(e) => patch({ name: e.target.value })}
          />
        </Field>
        <Field label="当前岗位（选填）">
          <TextInput
            value={background.currentRole}
            placeholder="例如：Java 后端开发 / 应届 / 转行中"
            onChange={(e) => patch({ currentRole: e.target.value })}
          />
        </Field>
        <Field label="学历">
          <Select
            value={background.education}
            onChange={(e) => patch({ education: e.target.value as UserBackground["education"] })}
          >
            {EDUCATION_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="专业（选填）">
          <TextInput
            value={background.major}
            placeholder="例如：软件工程"
            onChange={(e) => patch({ major: e.target.value })}
          />
        </Field>
        <Field
          label={`工作年限：${background.yearsExperience} 年`}
          hint="含实习可按折算填写；没有工作经验填 0。年限只影响对照职级称呼，不决定你能不能学。"
        >
          <input
            type="range"
            min={0}
            max={15}
            value={background.yearsExperience}
            onChange={(e) => patch({ yearsExperience: Number(e.target.value) })}
            className="mt-2 w-full accent-celadon"
          />
        </Field>
        <Field label="意向城市">
          <Select
            value={background.preferredCity}
            onChange={(e) => patch({ preferredCity: e.target.value })}
          >
            <option value="">未选择</option>
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="技术栈" hint="点击添加，再点一次移除。也可以在下面输入后回车。">
        <div className="mb-3 flex flex-wrap gap-2">
          {COMMON_STACK.map((item) => (
            <Chip
              key={item}
              active={background.techStack.some((s) => s.toLowerCase() === item.toLowerCase())}
              onClick={() =>
                background.techStack.some((s) => s.toLowerCase() === item.toLowerCase())
                  ? patch({
                      techStack: background.techStack.filter((s) => s.toLowerCase() !== item.toLowerCase()),
                    })
                  : addStack(item)
              }
            >
              {item}
            </Chip>
          ))}
        </div>
        <TextInput
          placeholder="其他技能，回车添加"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addStack(event.currentTarget.value);
              event.currentTarget.value = "";
            }
          }}
        />
        {background.techStack.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {background.techStack.map((item) => (
              <Chip
                key={item}
                active
                onClick={() =>
                  patch({ techStack: background.techStack.filter((s) => s !== item) })
                }
              >
                {item} ×
              </Chip>
            ))}
          </div>
        ) : null}
      </Field>

      <Field label="兴趣方向（可多选）" hint="用于推荐岗位，不会把你锁死在大模型相关方向。">
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((item) => (
            <Chip
              key={item}
              active={background.interests.includes(item)}
              onClick={() =>
                patch({
                  interests: background.interests.includes(item)
                    ? background.interests.filter((i) => i !== item)
                    : [...background.interests, item],
                })
              }
            >
              {item}
            </Chip>
          ))}
        </div>
      </Field>

      <Field
        label="项目与成果备注"
        hint="写你做过什么、约束是什么、结果如何。没有公司项目就写课程/个人项目，并标明。"
      >
        <TextArea
          rows={4}
          value={background.projectNotes}
          placeholder="例如：负责过订单查询接口，用 Redis 做过热点缓存；个人尚无完整开源作品。"
          onChange={(e) => patch({ projectNotes: e.target.value })}
        />
      </Field>

      <Field
        label="简历原文粘贴"
        hint="v1 不做 PDF 解析。把文本贴进来即可，技能识别与项目证据会扫描这段文字。"
      >
        <TextArea
          rows={8}
          value={background.resumeText}
          placeholder="粘贴简历或自我介绍。不必完美，有技术名词和项目叙述即可。"
          onChange={(e) => patch({ resumeText: e.target.value })}
        />
      </Field>
    </div>
  );
}
