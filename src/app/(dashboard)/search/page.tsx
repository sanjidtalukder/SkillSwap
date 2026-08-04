"use client";

import { useSearchStudents } from "@/features/users/hooks/useSearchStudents";
import { StudentSearchFilter } from "@/features/users/components/StudentSearchFilter";
import { StudentSearchCard } from "@/features/users/components/StudentSearchCard";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useConnectionRequest } from "@/features/profiles/hooks/useConnectionRequest";
import { useProfileRedirect } from "@/features/profiles/hooks/useProfileStatus";

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    isCheckingProfile,
    profileCompleted,
    error: profileError,
  } = useProfileRedirect(user, authLoading, {
    redirectWhenIncomplete: true,
  });
  const {
    notice: connectNotice,
    error: connectError,
    pendingRecipientId,
    sendConnectionRequest,
  } = useConnectionRequest(user);
  const {
    filters,
    setSearchTerm,
    setSkill,
    setDepartment,
    setSemester,
    results,
    isLoading,
    error,
    executeSearch,
    resetFilters,
  } = useSearchStudents();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="container mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Find Student Collaborators
          </h1>
          <p className="text-sm text-muted-foreground">
            Search by name, skill, department, or semester to find the perfect skill-swap partner.
          </p>
        </div>

        {/* Search Controls Filter */}
        <StudentSearchFilter
          searchTerm={filters.searchTerm}
          skill={filters.skill}
          department={filters.department}
          semester={filters.semester}
          onSearchTermChange={setSearchTerm}
          onSkillChange={setSkill}
          onDepartmentChange={setDepartment}
          onSemesterChange={setSemester}
          onSearch={() => executeSearch()}
          onReset={resetFilters}
          isLoading={isLoading}
        />

        {(profileError || error || connectError) && (
          <Alert variant="error">{profileError || error || connectError}</Alert>
        )}
        {connectNotice && <Alert variant="success">{connectNotice}</Alert>}

        {authLoading || isCheckingProfile || profileCompleted !== true || isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton count={6} />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((student) => (
              <StudentSearchCard
                key={student.uid}
                student={student}
                onConnect={sendConnectionRequest}
                isConnecting={pendingRecipientId === student.uid}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Students Found"
            description="Try adjusting your search terms, skill filters, department, or semester options."
            actionLabel="Reset Search"
            onAction={resetFilters}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
