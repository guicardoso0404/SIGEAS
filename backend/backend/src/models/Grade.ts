interface Grade{
    idGrade: number;
    studentId: number;
    classId: number,
    assessmentDate: Date;
    gradeItems: Record<string, number>;
    finalAverage: number;
}

export type { Grade }

// O Record<K, V> cria um tipo de objeto mapeado:
// K → o tipo das chaves (normalmente string ou um conjunto de strings definidas).
// V → o tipo dos valores que cada chave vai armazenar.