"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import PrescriptionPreviewTemplate from "./PrescriptionPreviewTemplate"
import type { PatientProfileForDoctor } from "@/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCreatePrescription } from "@/lib/api/prescription.service"
import { OverlayLoader } from "@/components/ui/overlay-loader"

const medicineSchema = z.object({
    medication_name: z.string().optional(),
    dosage: z.string().min(1, "Required"),
    frequency: z.string().min(1, "Required"),
    quantity: z.string().min(1, "Required"),
    duration: z.string().optional(),
    instructions: z.string().optional(),
})

const prescriptionSchema = z.object({
    diagnosis: z.string().min(1, "Diagnosis required"),
    notes: z.string().optional(),
    start_date: z.string().min(1, "Start date required"),
    end_date: z.string().optional(),
    items: z.array(medicineSchema).min(1, "At least one medicine required"),
})

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>

type AddPrescriptionDialogProps = {
    patient: PatientProfileForDoctor
    trigger: React.ReactNode
}

export default function AddPrescriptionDialog({ patient, trigger }: AddPrescriptionDialogProps) {
    const [open, setOpen] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const { mutateAsync: createPrescription, isPending: creatingPrescription } = useCreatePrescription()

    const form = useForm<PrescriptionFormValues>({
        resolver: zodResolver(prescriptionSchema),
        defaultValues: {
            diagnosis: "Blood Test",
            notes: "just test",
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
            items: [
                {
                    medication_name: "Surgel",
                    dosage: "20",
                    frequency: "2",
                    quantity: "10",
                    duration: "5",
                    instructions: "Before Food",
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    })

    async function onSubmit(data: PrescriptionFormValues) {
        await createPrescription({
            ...data,
            end_date: data.end_date || undefined,
            patient_id: patient.id,
        }, {
            onSuccess: () => {
                setOpen(false)
                form.reset()
            }
        })
    }

    function PrescriptionPreview() {
        return (
            <PrescriptionPreviewTemplate
                patient={{
                    id: patient.id || "",
                    name: patient.name || "",
                    age: patient.age ?? 0,
                    gender: (patient.gender ?? '') + '',
                    phone: patient.phone || '',
                }}
                items={form.getValues("items")}
                diagnosis={form.getValues("diagnosis")}
                notes={form.getValues("notes")}
                start_date={form.getValues("start_date")}
            />
        )
    }

    return (
        <>
            {creatingPrescription ? <OverlayLoader message="Creating Prescription..." /> : null}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="!max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            Add Prescription
                        </DialogTitle>
                    </DialogHeader>

                    {!showPreview ? (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-sm">
                                            Patient Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <FormLabel>Patient Name</FormLabel>
                                                <p className="font-medium">{patient.name}</p>
                                            </div>
                                            <div>
                                                <FormLabel>Age</FormLabel>
                                                <p className="font-medium">{patient.age} years</p>
                                            </div>
                                            <div>
                                                <FormLabel>Gender</FormLabel>
                                                <p className="font-medium">{patient.gender}</p>
                                            </div>
                                            <div>
                                                <FormLabel>Contact</FormLabel>
                                                <p className="font-medium">{patient?.phone}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Prescription Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="diagnosis"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Diagnosis *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Fever, Viral Infection" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="notes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Notes</FormLabel>
                                                    <Textarea placeholder="Any additional notes..." {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="start_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Start Date *</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="end_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>End Date</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Medicines</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {fields.map((field, idx) => (
                                            <div key={field.id} className="border p-3 rounded-lg mb-2 relative">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-semibold">Medicine #{idx + 1}</span>
                                                    {fields.length > 1 && (
                                                        <Button size="sm" variant="destructive" type="button" onClick={() => remove(idx)}>
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-2">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${idx}.medication_name`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Medication Name</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., Paracetamol" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${idx}.dosage`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Dosage *</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., 500mg" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${idx}.frequency`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Frequency *</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., every 8 hours" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${idx}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Quantity *</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., 10 tablets" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${idx}.duration`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Duration</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., 5 days" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${idx}.instructions`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Instructions</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="e.g., After food" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" onClick={() => append({ medication_name: "", dosage: "", frequency: "", quantity: "", duration: "", instructions: "" })}>
                                            + Add Medicine
                                        </Button>
                                    </CardContent>
                                </Card>

                                <div className="flex justify-end space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowPreview(true)}
                                        disabled={form.formState.isSubmitting || !form.formState.isValid}
                                    >
                                        Preview
                                    </Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting || creatingPrescription}>
                                        {creatingPrescription ? "Saving..." : "Save Prescription"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    ) : (
                        <div className="space-y-4">
                            <PrescriptionPreview />
                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setShowPreview(false)}>
                                    ← Back to Edit
                                </Button>
                                <Button onClick={form.handleSubmit(onSubmit)} disabled={form.formState.isSubmitting || creatingPrescription}>
                                    {creatingPrescription ? "Saving..." : "Confirm Prescription"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
