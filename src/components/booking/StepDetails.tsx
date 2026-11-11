"use client"

import { useEffect, useMemo } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch } from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/i18n/locale-provider"
import { formatPhoneInput } from "@/lib/format"
import {
  PHONE_COUNTRY_PREFIX,
  createClientDetailsSchema,
  type ClientDetailsFormValues,
} from "@/lib/types"

const NOTES_LIMIT = 240

interface StepDetailsProps {
  /** `id` of the form, so the wizard's Confirm button can submit it. */
  formId: string
  defaultValues: ClientDetailsFormValues
  disabled: boolean
  /** Called on every edit so the draft survives a refresh. */
  onDraftChange: (values: ClientDetailsFormValues) => void
  onSubmit: (values: ClientDetailsFormValues) => void
}

/** Step 4: who the booking is for. */
export function StepDetails({
  formId,
  defaultValues,
  disabled,
  onDraftChange,
  onSubmit,
}: StepDetailsProps) {
  const { t } = useI18n()
  const copy = t.booking.details

  const schema = useMemo(() => createClientDetailsSchema(copy.errors), [copy.errors])
  const form = useForm<ClientDetailsFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  })
  const { errors } = form.formState
  const notesLength = useWatch({ control: form.control, name: "notes" }).length

  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ values }) => onDraftChange(values),
      }),
    [form, onDraftChange]
  )

  return (
    <form
      id={formId}
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <fieldset disabled={disabled} className="contents">
        <FieldGroup>
          <Field data-invalid={Boolean(errors.fullName)}>
            <FieldLabel htmlFor="booking-full-name">{copy.fullName}</FieldLabel>
            <Input
              id="booking-full-name"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="next"
              placeholder={copy.fullNamePlaceholder}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "booking-full-name-error" : undefined}
              className="h-12 px-3.5 text-base md:text-base"
              {...form.register("fullName")}
            />
            <FieldError id="booking-full-name-error" errors={[errors.fullName]} />
          </Field>

          <Field data-invalid={Boolean(errors.phone)}>
            <FieldLabel htmlFor="booking-phone">{copy.phone}</FieldLabel>
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <div className="relative">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base text-muted-foreground"
                  >
                    {PHONE_COUNTRY_PREFIX}
                  </span>
                  <Input
                    id="booking-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    enterKeyHint="next"
                    placeholder="(67) 123-45-67"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? "booking-phone-error" : "booking-phone-hint"
                    }
                    className="h-12 pr-3.5 pl-[3.6rem] text-base md:text-base"
                    name={field.name}
                    ref={field.ref}
                    value={field.value}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(formatPhoneInput(event.target.value))
                    }
                  />
                </div>
              )}
            />
            {errors.phone ? (
              <FieldError id="booking-phone-error" errors={[errors.phone]} />
            ) : (
              <FieldDescription id="booking-phone-hint">
                {copy.phoneHint}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="booking-email">{copy.email}</FieldLabel>
            <Input
              id="booking-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="name@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "booking-email-error" : "booking-email-hint"
              }
              className="h-12 px-3.5 text-base md:text-base"
              {...form.register("email")}
            />
            {errors.email ? (
              <FieldError id="booking-email-error" errors={[errors.email]} />
            ) : (
              <FieldDescription id="booking-email-hint">
                {copy.emailHint}
              </FieldDescription>
            )}
          </Field>

          <Field data-invalid={Boolean(errors.notes)}>
            <FieldLabel htmlFor="booking-notes" className="w-full justify-between">
              <span>
                {copy.notes}{" "}
                <span className="font-normal text-muted-foreground">
                  ({t.common.optional})
                </span>
              </span>
              <span
                aria-hidden
                className={
                  notesLength > NOTES_LIMIT
                    ? "font-normal text-destructive"
                    : "font-normal text-muted-foreground"
                }
              >
                {notesLength}/{NOTES_LIMIT}
              </span>
            </FieldLabel>
            <Textarea
              id="booking-notes"
              rows={3}
              placeholder={copy.notesPlaceholder}
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? "booking-notes-error" : undefined}
              className="min-h-24 px-3.5 py-3 text-base md:text-base"
              {...form.register("notes")}
            />
            <FieldError id="booking-notes-error" errors={[errors.notes]} />
          </Field>
        </FieldGroup>
      </fieldset>

      <p className="text-sm leading-relaxed text-muted-foreground">{copy.policy}</p>
    </form>
  )
}
