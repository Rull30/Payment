import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-4 ${className}`}>
            <header>
                <h2 className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    Hapus Akun Permanen
                </h2>

                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Setelah akun Anda dihapus, semua data dan invoice akan dihapus secara permanen. Sebelum menghapus akun, pastikan Anda telah mencadangkan data penting Anda.
                </p>
            </header>

            <div className="pt-2">
                <DangerButton onClick={confirmUserDeletion}>
                    Hapus Akun
                </DangerButton>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 space-y-4 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Apakah Anda yakin ingin menghapus akun ini?
                        </h2>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Tindakan ini tidak dapat dibatalkan. Masukkan kata sandi akun Anda untuk mengonfirmasi penghapusan permanen.
                        </p>
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi Akun"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-full text-xs"
                            isFocused
                            placeholder="Masukkan kata sandi Anda..."
                        />

                        <InputError
                            message={errors.password}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <SecondaryButton onClick={closeModal}>
                            Batal
                        </SecondaryButton>

                        <DangerButton disabled={processing}>
                            Konfirmasi Hapus Akun
                        </DangerButton>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
