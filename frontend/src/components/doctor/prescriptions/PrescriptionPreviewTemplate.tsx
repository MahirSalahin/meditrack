// PrescriptionPreviewTemplate.tsx
// A4-sized, minimal, clean prescription preview for Meditrack
import React from "react"
import { Phone, MapPin } from "lucide-react"

interface PrescriptionPreviewTemplateProps {
    patient: { id: string; name: string; age: number; gender: string; phone?: string }
    items: Array<{
        medication_name?: string
        dosage: string
        frequency: string
        quantity: string
        duration?: string
        instructions?: string
    }>
    diagnosis: string
    notes?: string
    start_date: string
}

const PrescriptionPreviewTemplate: React.FC<PrescriptionPreviewTemplateProps> = ({ patient, items, diagnosis, notes, start_date }) => {
    return (
        <div className="bg-white text-black p-6 max-w-[210mm] w-[210mm] mx-auto shadow border text-sm">
            {/* Letterhead */}
            <div className="border-b-4 border-blue-600 pb-4 mb-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                            <div className="text-white text-2xl font-bold">⚕</div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-blue-700">Dr. Sarah Johnson</h1>
                            <p className="text-base text-gray-700">MBBS, MD - Internal Medicine</p>
                            <p className="text-xs text-gray-600">Reg. No: 12345 | License: MD123456789</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-gray-800">MEDITRACK CLINIC</h2>
                        <p className="text-xs text-gray-600 flex items-center justify-end mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            123 Medical Center Drive, Healthcare City
                        </p>
                        <p className="text-xs text-gray-600 flex items-center justify-end">
                            <Phone className="w-3 h-3 mr-1" />
                            +1 (555) 000-1234
                        </p>
                    </div>
                </div>
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 p-3 rounded-lg mb-4 border">
                <div className="grid grid-cols-4 gap-4 text-xs">
                    <div>
                        <span className="font-semibold text-gray-700">Patient Name:</span>
                        <div className="font-medium mt-1">{patient.name}</div>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700">Age/Gender:</span>
                        <div className="font-medium mt-1">{patient.age}Y / {patient.gender}</div>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700">Patient ID:</span>
                        <div className="font-medium mt-1">{patient.id.slice(0, 8)}...</div>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700">Date:</span>
                        <div className="font-medium mt-1">
                            {new Date(start_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Diagnosis */}
            <div className="mb-4">
                <div className="flex items-center mb-1">
                    <span className="font-bold text-gray-800 text-base">Diagnosis:</span>
                </div>
                <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-600">
                    <p className="font-medium text-gray-800 text-sm">{diagnosis}</p>
                </div>
            </div>

            {/* Prescription Symbol and Title */}
            <div className="flex items-center mb-4 border-b border-gray-300 pb-2">
                <div className="text-4xl font-bold text-blue-600 mr-4">℞</div>
                <h3 className="text-xl font-bold text-gray-800">PRESCRIPTION</h3>
            </div>

            {/* Medications List */}
            <div className="mb-6">
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="border-b border-gray-200 pb-2 last:border-b-0">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-baseline space-x-2">
                                        <span className="font-bold text-gray-800 min-w-[20px]">{idx + 1}.</span>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-bold text-blue-700 text-base">
                                                    {item.medication_name || `Medicine #${idx + 1}`}
                                                </span>
                                                <span className="font-semibold text-gray-700 text-sm">
                                                    {item.dosage}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 space-x-4">
                                                <span><strong>Freq:</strong> {item.frequency}</span>
                                                <span><strong>Qty:</strong> {item.quantity}</span>
                                                {item.duration && <span><strong>Duration:</strong> {item.duration}</span>}
                                                {item.instructions && <span><strong>Instructions:</strong> {item.instructions}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* General Instructions */}
            <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="font-bold text-gray-800 mb-1 text-base">📋 General Instructions:</h4>
                <ul className="text-gray-700 space-y-1 text-xs">
                    <li>• Take medications as prescribed</li>
                    <li>• Complete the full course even if you feel better</li>
                    <li>• Store medicines in a cool, dry place</li>
                    <li>• Contact doctor if any adverse reactions occur</li>
                </ul>
            </div>

            {/* Additional Notes */}
            {notes && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-bold text-gray-800 mb-1 text-base">📝 Additional Notes:</h4>
                    <p className="text-gray-700 text-xs">{notes}</p>
                </div>
            )}
        </div>
    )
}

export default PrescriptionPreviewTemplate; 