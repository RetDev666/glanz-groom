import os

with open('frontend/pages/book.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace step 0
parts = text.split('{/* ── STEP 0: Services ── */}')
part1 = parts[0]
after_step_0 = parts[1].split('{/* ── STEP 1: Groomer ── */}')
part3 = after_step_0[1]

new_step_0 = """{/* ── STEP 0: Services ── */}
        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-display text-headline-lg text-on-surface">{t.book.step0.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">{t.book.step0.desc}</p>
            </div>

            {booking.pets.map((pet, petIndex) => (
              <div key={pet.id} className="relative bg-surface-container-low rounded-2xl p-4 border border-surface-variant">
                {booking.pets.length > 1 && (
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline">
                    <h3 className="font-display text-label-lg font-bold text-primary">Собака {petIndex + 1}</h3>
                    <button onClick={() => removePet(petIndex)} className="text-error hover:bg-error-container p-1 rounded">
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                )}
                
                <p className="font-sans text-label-lg text-on-surface mb-3">{t.book.step0.petSize}</p>
                <div className="flex flex-wrap gap-2">
                  {(['xs', 's', 'm', 'l', 'xl'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => {
                        const newPets = [...booking.pets];
                        newPets[petIndex] = { ...pet, petSize: size };
                        setBooking({ ...booking, pets: newPets });
                      }}
                      className={`flex-1 py-2 px-3 rounded-xl font-sans text-label-sm transition-all ${
                        pet.petSize === size
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'bg-surface border border-surface-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {size.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="font-sans text-label-sm text-on-surface-variant mt-3 text-center">{SIZE_LABELS[pet.petSize]}</p>
                {breedsConfig[pet.petSize] && (
                  <p className="font-sans text-label-sm text-on-surface-variant/80 mt-1 text-center italic">
                    Beispiele: {breedsConfig[pet.petSize].join(', ')}
                  </p>
                )}

                <div className="flex flex-col gap-3 mt-6">
                  <h3 className="font-sans text-label-lg text-on-surface uppercase tracking-widest pl-2 border-l-2 border-primary">{t.book.step0.mainPackages}</h3>
                  {packages.map(svc => {
                    const selected = pet.selectedServices.includes(svc.id);
                    const p = svc[SIZE_PRICE_KEY[pet.petSize] as keyof Service];
                    const d = svc[SIZE_DURATION_KEY[pet.petSize] as keyof Service];
                    return (
                      <label key={svc.id} className="relative block cursor-pointer">
                        <input type="radio" name={`package-${pet.id}`} className="sr-only" checked={selected} onChange={() => toggleService(petIndex, svc.id, true)} />
                        <div className={`bg-surface rounded-2xl border-2 transition-all flex items-center p-4 gap-4 ${selected ? 'border-primary shadow-md' : 'border-surface-variant'}`}>
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-sans text-label-lg text-on-surface">{getServiceName(svc)}</h4>
                              <span className="font-display font-bold text-primary">{p}€</span>
                            </div>
                            <p 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setExpandedDesc(prev => ({ ...prev, [svc.id]: !prev[svc.id] }));
                              }}
                              className={`font-sans text-body-md text-on-surface-variant text-sm transition-all duration-300 ${expandedDesc[svc.id] ? '' : 'line-clamp-2'}`}
                            >
                              {svc.description}
                            </p>
                            <p className="font-sans text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {d} {t.book.step0.min}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-primary bg-primary' : 'border-outline'}`}>
                            {selected && <div className="w-2.5 h-2.5 bg-on-primary rounded-full" />}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-3 mt-4">
                  <h3 className="font-sans text-label-lg text-on-surface uppercase tracking-widest pl-2 border-l-2 border-secondary">{t.book.step0.additional}</h3>
                  {addons.map(svc => {
                    const selected = pet.selectedServices.includes(svc.id);
                    const p = svc[SIZE_PRICE_KEY[pet.petSize] as keyof Service];
                    const d = svc[SIZE_DURATION_KEY[pet.petSize] as keyof Service];
                    return (
                      <label key={svc.id} className="relative block cursor-pointer">
                        <input type="checkbox" className="sr-only" checked={selected} onChange={() => toggleService(petIndex, svc.id, false)} />
                        <div className={`bg-surface rounded-2xl border-2 transition-all flex items-center p-4 gap-4 ${selected ? 'border-secondary shadow-md' : 'border-surface-variant'}`}>
                          <div className="flex flex-col flex-1 gap-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-sans text-label-lg text-on-surface">{getServiceName(svc)}</h4>
                              <span className="font-display font-bold text-secondary">{p}€</span>
                            </div>
                            <p className="font-sans text-label-sm text-on-surface-variant flex items-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {d} {t.book.step0.min}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 ${selected ? 'border-secondary bg-secondary' : 'border-outline'}`}>
                            {selected && <span className="material-symbols-outlined text-[16px] text-on-secondary">check</span>}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <button onClick={addPet} className="w-full py-4 border-2 border-dashed border-primary text-primary rounded-2xl font-sans text-label-lg hover:bg-primary-container transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">pets</span>
              Додати ще собаку
            </button>
          </div>
        )}

        {/* ── STEP 1: Groomer ── */}"""

text = part1 + new_step_0 + part3

# Replace step 3
parts_3 = text.split('{/* ── STEP 3: Details ── */}')
part3_1 = parts_3[0]
after_step_3 = parts_3[1].split('{/* BOTTOM ACTION BAR */}')
part3_3 = after_step_3[1]

new_step_3 = """{/* ── STEP 3: Details ── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h2 className="font-display text-headline-lg text-on-surface">{t.book.step3.title}</h2>
              <p className="font-sans text-body-md text-on-surface-variant">{t.book.step3.desc}</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.firstName}</label>
                  <input type="text" value={booking.firstName} onChange={e => setBooking({ ...booking, firstName: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.firstNamePh} />
                </div>
                <div>
                  <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.lastName}</label>
                  <input type="text" value={booking.lastName} onChange={e => setBooking({ ...booking, lastName: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.lastNamePh} />
                </div>
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.phone}</label>
                <input type="tel" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.phonePh} />
              </div>
              <div>
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.email}</label>
                <input type="email" value={booking.email} onChange={e => setBooking({ ...booking, email: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.emailPh} />
              </div>

              {booking.pets.map((pet, petIndex) => (
                <div key={pet.id} className="p-4 bg-surface-container-low border border-surface-variant rounded-xl mt-4">
                  <h3 className="font-display text-label-lg font-bold text-primary mb-3 pb-2 border-b border-outline">Собака {petIndex + 1} ({SIZE_LABELS[pet.petSize]})</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.petName}</label>
                      <input type="text" value={pet.petName} onChange={e => {
                        const newPets = [...booking.pets];
                        newPets[petIndex] = { ...pet, petName: e.target.value };
                        setBooking({ ...booking, pets: newPets });
                      }} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.petNamePh} />
                    </div>
                    <div>
                      <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.petBreed}</label>
                      <input type="text" list={`breed-suggestions-${pet.id}`} value={pet.petBreed} onChange={e => {
                        const newPets = [...booking.pets];
                        newPets[petIndex] = { ...pet, petBreed: e.target.value };
                        setBooking({ ...booking, pets: newPets });
                      }} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" placeholder={t.book.step3.petBreedPh} />
                      {breedsConfig[pet.petSize] && breedsConfig[pet.petSize].length > 0 && (
                        <datalist id={`breed-suggestions-${pet.id}`}>
                          {breedsConfig[pet.petSize].map(b => (
                            <option key={b} value={b} />
                          ))}
                        </datalist>
                      )}
                    </div>
                  </div>

                  {/* Pet Photo Upload */}
                  <div className="mt-4">
                    <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.photoLabel}</label>
                    <div 
                      onClick={() => {
                        const input = document.getElementById(`photoUpload-${pet.id}`);
                        if (input) input.click();
                      }}
                      className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${pet.photoPreview ? 'border-primary bg-primary-container/10' : 'border-outline hover:border-primary bg-surface'}`}
                    >
                      <input 
                        type="file" 
                        id={`photoUpload-${pet.id}`}
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handlePhotoChange(petIndex, e as any)}
                      />
                      {pet.photoPreview ? (
                        <div className="flex items-center gap-4 w-full">
                          <img src={pet.photoPreview} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-outline" />
                          <div className="flex-1">
                            <p className="font-sans text-label-md text-on-surface font-semibold">{pet.photoFile?.name}</p>
                            <p className="font-sans text-body-sm text-primary hover:underline">{t.book.step3.photoChange}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="material-symbols-outlined text-[32px] text-on-surface-variant mb-2">add_a_photo</span>
                          <p className="font-sans text-label-md text-on-surface">{t.book.step3.photoHelp}</p>
                          <p className="font-sans text-body-sm text-on-surface-variant">{t.book.step3.photoTypes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <label className="block font-sans text-label-sm text-on-surface-variant mb-1">{t.book.step3.notes}</label>
                <textarea value={booking.notes} onChange={e => setBooking({ ...booking, notes: e.target.value })} className="w-full bg-surface border border-outline rounded-xl px-4 py-3 focus:border-primary focus:ring-1 outline-none" rows={3} placeholder={t.book.step3.notesPh}></textarea>
              </div>

              <div className="pt-4 border-t border-surface-variant">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={booking.acceptTerms} 
                      onChange={e => setBooking({ ...booking, acceptTerms: e.target.checked })} 
                    />
                    <div className={`w-6 h-6 rounded border-2 transition-all flex items-center justify-center ${booking.acceptTerms ? 'bg-primary border-primary' : 'bg-surface border-outline group-hover:border-primary'}`}>
                      {booking.acceptTerms && <span className="material-symbols-outlined text-on-primary text-[18px]">check</span>}
                    </div>
                  </div>
                  <span className="font-sans text-body-sm text-on-surface-variant leading-tight">
                    Ich bin mit den <a href="/agb" className="text-primary hover:underline" target="_blank" onClick={e => e.stopPropagation()}>Allgemeinen Geschäftsbedingungen</a> einverstanden und bestätige, dass mein Hund keine ansteckenden Krankheiten hat.
                  </span>
                </label>
              </div>
            </div>
            {error && <div className="p-4 bg-error-container text-on-error-container rounded-xl font-sans text-body-sm text-center">{error}</div>}
          </div>
        )}

      </main>

      {/* BOTTOM ACTION BAR */}"""

text = part3_1 + new_step_3 + part3_3

with open('frontend/pages/book.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Step 0 and Step 3 replaced!")
