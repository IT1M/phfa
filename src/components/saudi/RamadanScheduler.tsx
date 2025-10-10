'use client';

import { useState } from 'react';
import { Calendar, Clock, Pill, Plus, Trash2 } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  nameAr: string;
  originalTiming: string;
  ramadanTiming: 'suhoor' | 'iftar' | 'isha';
  dosage: string;
  notes: string;
}

interface RamadanSchedulerProps {
  locale?: 'en' | 'ar';
  onSave?: (medications: Medication[]) => void;
}

export default function RamadanScheduler({ locale = 'en', onSave }: RamadanSchedulerProps) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const addMedication = (med: Omit<Medication, 'id'>) => {
    const newMed = { ...med, id: Date.now().toString() };
    setMedications([...medications, newMed]);
    setShowAddForm(false);
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onSave?.(medications);
  };

  const timingOptions = [
    { value: 'suhoor', label: locale === 'ar' ? 'قبل السحور' : 'Before Suhoor', icon: '🌙' },
    { value: 'iftar', label: locale === 'ar' ? 'بعد الإفطار' : 'After Iftar', icon: '🌅' },
    { value: 'isha', label: locale === 'ar' ? 'بعد العشاء' : 'After Isha', icon: '🌃' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'جدول الأدوية في رمضان' : 'Ramadan Medication Schedule'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {locale === 'ar' 
                ? 'عدّل مواعيد أدويتك لتناسب أوقات الصيام'
                : 'Adjust your medication times for fasting hours'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-saudi-green text-white rounded-lg hover:bg-saudi-green/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {locale === 'ar' ? 'إضافة دواء' : 'Add Medication'}
        </button>
      </div>

      {/* Ramadan Info Banner */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌙</span>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              {locale === 'ar' ? 'نصائح مهمة للصيام' : 'Important Fasting Tips'}
            </h4>
            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
              <li>• {locale === 'ar' ? 'استشر طبيبك قبل تعديل مواعيد الأدوية' : 'Consult your doctor before adjusting medication times'}</li>
              <li>• {locale === 'ar' ? 'اشرب كمية كافية من الماء بين الإفطار والسحور' : 'Drink adequate water between Iftar and Suhoor'}</li>
              <li>• {locale === 'ar' ? 'أفطر فوراً إذا شعرت بتوعك' : 'Break your fast immediately if feeling unwell'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Medications List */}
      <div className="space-y-3">
        {medications.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Pill className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{locale === 'ar' ? 'لم تضف أي أدوية بعد' : 'No medications added yet'}</p>
            <p className="text-sm mt-1">
              {locale === 'ar' ? 'انقر على "إضافة دواء" للبدء' : 'Click "Add Medication" to start'}
            </p>
          </div>
        ) : (
          medications.map((med) => {
            const timing = timingOptions.find(t => t.value === med.ramadanTiming);
            return (
              <div
                key={med.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-saudi-green transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Pill className="w-5 h-5 text-saudi-green" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {locale === 'ar' ? med.nameAr : med.name}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {locale === 'ar' ? 'التوقيت الأصلي:' : 'Original:'}
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">{med.originalTiming}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {locale === 'ar' ? 'توقيت رمضان:' : 'Ramadan:'}
                        </span>
                        <span className="ml-2 text-saudi-green font-medium">
                          {timing?.icon} {timing?.label}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {locale === 'ar' ? 'الجرعة:' : 'Dosage:'}
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-white">{med.dosage}</span>
                      </div>
                    </div>
                    {med.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                        {med.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeMedication(med.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {locale === 'ar' ? 'إضافة دواء جديد' : 'Add New Medication'}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addMedication({
                  name: formData.get('name') as string,
                  nameAr: formData.get('nameAr') as string,
                  originalTiming: formData.get('originalTiming') as string,
                  ramadanTiming: formData.get('ramadanTiming') as any,
                  dosage: formData.get('dosage') as string,
                  notes: formData.get('notes') as string
                });
              }}
              className="space-y-4"
            >
              <input
                name="name"
                required
                placeholder={locale === 'ar' ? 'اسم الدواء (English)' : 'Medication Name (English)'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                name="nameAr"
                required
                placeholder={locale === 'ar' ? 'اسم الدواء (عربي)' : 'Medication Name (Arabic)'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                dir="rtl"
              />
              <input
                name="originalTiming"
                required
                placeholder={locale === 'ar' ? 'التوقيت الأصلي' : 'Original Timing'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <select
                name="ramadanTiming"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">{locale === 'ar' ? 'اختر التوقيت في رمضان' : 'Select Ramadan Timing'}</option>
                {timingOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
              <input
                name="dosage"
                required
                placeholder={locale === 'ar' ? 'الجرعة' : 'Dosage'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <textarea
                name="notes"
                placeholder={locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-saudi-green text-white rounded-lg hover:bg-saudi-green/90"
                >
                  {locale === 'ar' ? 'إضافة' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Button */}
      {medications.length > 0 && (
        <button
          onClick={handleSave}
          className="w-full px-4 py-3 bg-saudi-green text-white rounded-lg hover:bg-saudi-green/90 transition-colors font-semibold"
        >
          {locale === 'ar' ? 'حفظ الجدول' : 'Save Schedule'}
        </button>
      )}
    </div>
  );
}
